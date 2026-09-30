import uuid
import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import extract, select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from db.models import Base, Link, Post, Tag, Status, Details
from db.config import get_db, engine, s3, S3_BUCKET
from schemas.schemas import LinksModel, PostModel, TagModel, StatusModel, DetailsModel, UpdateLinkModel, CreatePostResponse

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware('http')
async def verify_admin_key(req: Request, call_next):
    if req.method == 'OPTIONS':
        return await call_next(req)
    path = req.url.path
    path = path.rstrip('/')
    if path.startswith('/admin') and not path.startswith('/admin/login'):
        if req.headers.get('X-Admin-Key') != ADMIN_SECURE_KEY:
            return JSONResponse(status_code=403, content={'detail': 'Unauthorized'})

    return await call_next(req)

# Used for dev image storage
if os.getenv('ENVIRONMENT') == 'development':
    UPLOAD_DIR = '/app/uploaded_images'
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    app.mount('/images', StaticFiles(directory=UPLOAD_DIR), name='images')

        
PAGE_SIZE = 5

@app.get('/posts')
async def all_posts(page: int = Query(1, ge=1), month: int | None = Query(None, ge=1, le=12), year: int | None = Query(None, ge=2003),  db: Session = Depends(get_db)):
    offset = (page - 1) * PAGE_SIZE

    stmt = select(Post)

    if month and year:
        start = datetime(year, month, 1, tzinfo=timezone.utc)

        if month == 12:
            end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            end = datetime(year, month + 1, 1, tzinfo=timezone.utc)

        stmt = stmt.where(Post.date >= start, Post.date < end)

    stmt = stmt.order_by(Post.date.desc()).limit(PAGE_SIZE).offset(offset)
    posts = db.scalars(stmt).all()

    if not posts:
        raise HTTPException(
            status_code=404,
            detail='No Posts found'
        )

    return posts



@app.get('/posts/{post_id}', response_model=PostModel)
async def get_post(post_id: uuid.UUID, db: Session = Depends(get_db)):
    stmt = db.get(Post, post_id)
    res = db.scalars(stmt).first()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='Post not found',
        )

    return res

@app.get('/info/posts')
async def get_posts_dates(db: Session = Depends(get_db)):
    stmt = select(
                extract('year', Post.date).label('year'),
                extract('month', Post.date).label('month'),
                func.count(Post.id).label('count')
            ).group_by(
                extract('year', Post.date),
                extract('month', Post.date)
            ).order_by(
                extract('year', Post.date).desc(),
                extract('month', Post.date).desc()  
            )
    res = db.execute(stmt).all()    
    
    if not res:
        raise HTTPException(
            status_code=404,
            detail='Posts with that tag not found',
        )   

    return [
        { 
            'year' : int(year),
            'month' : int(month),
            'count' : count, 
        }
        for year, month, count in res
    ] 

@app.get('/posts/tags/{tag_id}')
async def get_posts_by_tag(tag_id: str, page: int = Query(1, ge=1), db: Session = Depends(get_db)):

    offset = (page - 1) * PAGE_SIZE

    stmt = select(Post).where(Post.tag_id == tag_id).order_by(Post.date.desc()).limit(PAGE_SIZE).offset(offset)
    res = db.scalars(stmt).all()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='Posts with that tag not found',
        )   

    return res

@app.get('/tags')
async def get_all_tags(db: Session = Depends(get_db)):
    stmt = select(Tag)
    res = db.scalars(stmt).all()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='No Tags Found'
        )
    return res

@app.get('/statuses')
async def get_statuses(db: Session = Depends(get_db)):
    stmt = select(Status)
    res = db.scalars(stmt).all()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='No Statuses Found'
        )
    return res

@app.get('/details')
async def get_details(db: Session = Depends(get_db)):
    stmt = select(Details).order_by(Details.created_at.desc())
    res = db.scalars(stmt).first()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='No details found'
        )

    if res.image_data and os.getenv('ENVIRONMENT') != 'development':
        res.image_data = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': res.image_data,
            },
            ExpiresIn=3600,
        )

    return res

@app.get('/links')
async def get_links(db: Session = Depends(get_db)):
    stmt = select(Link)
    res = db.scalars(stmt).all()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='No Links Found'
        )
    return res

# --- ADMIN METHODS --- 

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')
ADMIN_SECURE_KEY = os.environ.get('ADMIN_SECURE_KEY')

@app.post('/admin/login')
async def admin_login(payload: dict):
    if payload.get('password') != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail='Invalid Login'
        )
    return { 'admin_key': ADMIN_SECURE_KEY }


@app.put('/admin/details')
async def update_details(file: UploadFile = File(None), bio: str = Form(''), email: str = Form(''), db: Session = Depends(get_db)):
    db_item = db.scalar(select(Details).order_by(Details.created_at.desc()))
    if not db_item:
        db_item = Details()
        db.add(db_item)

    if file:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail='File must be an image' 
            )

        if os.getenv('ENVIRONMENT') == 'development': 
            safe_title = str(file.filename).replace(' ', '_')
            file_path = os.path.join(UPLOAD_DIR, safe_title)

            file_byes = await file.read()

            with open(file_path, 'wb') as buffer:
                buffer.write(file_byes)

            image_url = f'/images/{safe_title}'
        else: 
            extension = Path(file.filename or "").suffix
            safe_title = f"{uuid.uuid4()}{extension}"

            file_bytes = await file.read()

            s3.put_object(
                Bucket=S3_BUCKET,
                Key=f'media/{safe_title}',
                Body=file_bytes,
                ContentType=file.content_type,
            )

            image_url = f"https://{S3_BUCKET}.s3.amazonaws.com/media/{safe_title}"

        db_item.image_data = image_url

    if bio != '':
        db_item.bio = bio

    if email != '':
        db_item.email = email  

    try:
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        print(e)
        raise HTTPException(
            status_code=400,
            detail='db constraint fail'
        )

    return db_item

class UpdateStatusModel(BaseModel):
    id: str
    title: str
    body:str

@app.put('/admin/statuses')
async def update_status(payload: UpdateStatusModel, db: Session = Depends(get_db)):
    db_item = db.get(Status, payload.id)
    if not db_item:
        raise HTTPException(
            status_code=400,
            detail='Could not find status',
        )

    db_item.title = payload.title if payload.title else db_item.title
    db_item.body = payload.body if payload.body else db_item.body

    try:
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail='db constraint fail'
        )

    return db_item

class UpdateTagModel(BaseModel):
    tag_id: str
    updated_tag: str

@app.put('/admin/tags')
async def update_tag(payload: UpdateTagModel, db: Session = Depends(get_db)):
    db_item = db.get(Tag, payload.tag_id)

    if not db_item:
        raise HTTPException(
            status_code=400,
            detail='Could not find status',
        )

    db_item.id = payload.updated_tag

    try:
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail='db constraint fail'
        )

    return db_item

@app.put('/admin/links/{link_id}', response_model=LinksModel, status_code=200)
async def update_link(link_id: str, payload: UpdateLinkModel, db: Session = Depends(get_db)):
    db_item = db.get(Link, link_id)

    if not db_item:
        raise HTTPException(
            status_code=400,
            detail='Could not find status',
    )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    
    return db_item


class CreateTagModel(BaseModel):
    tag_id: str

@app.post('/admin/tags', response_model=TagModel, status_code=201)
async def create_tag(payload: CreateTagModel, db: Session = Depends(get_db)):

    db_post = Tag(
        id=payload.tag_id
    )
    db.add(db_post)
    db.commit() 
    db.refresh(db_post)
    return db_post  

@app.post('/admin/links', response_model=LinksModel, status_code=201)
async def create_link(payload: LinksModel, db: Session = Depends(get_db)):
    db_post = Link(
        display=payload.display,
        external_link=payload.external_link,
    )
    db.add(db_post)
    db.commit() 
    db.refresh(db_post)
    return db_post  

@app.post('/admin/statuses')
async def create_status(payload: StatusModel, db: Session = Depends(get_db)):
    db_post = Status(
        title=payload.title,
        body=payload.body,
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

class NewPostModel(BaseModel):
    title: str
    body: str
    link: str
    tag_id: str

@app.post('/admin/posts', response_model=CreatePostResponse, status_code=201)
async def create_post(payload: NewPostModel, db: Session = Depends(get_db)):
    db_tag = db.get(Tag, payload.tag_id)

    new_tag = None
    if not db_tag:
        try:
            new_tag = Tag(
                id=payload.tag_id
            )
            db.add(new_tag)
            db.flush()
        except:
            raise HTTPException(
                status_code=400,
                detail='Failed to create new tag',
            )
    db_post = Post(
        date=datetime.now(timezone.utc),
        link=payload.link,
        title=payload.title,
        body=payload.body,
        tag_id=payload.tag_id,
    )

    db.add(db_post)
    db.commit() 
    db.refresh(db_post)
    return {'tag': new_tag, 'post': db_post} if new_tag else {'post': db_post}

@app.delete('/admin/posts/{post_id}')
async def delete_post(post_id: uuid.UUID, db: Session = Depends(get_db)):
    db_item = db.get(Post, post_id)

    if not db_item:
        raise HTTPException(
            status_code=400,
            detail='Could not find tag',
        )

    db.delete(db_item)
    db.commit() 

    return None

@app.delete('/admin/tags/{tag_id}')
async def delete_tag(tag_id: str, db: Session = Depends(get_db)):
    db_item = db.get(Tag, tag_id)

    if not db_item:
        raise HTTPException(
            status_code=400,
            detail='Could not find tag',
        )

    db.delete(db_item)
    db.commit() 

    return None


@app.delete('/admin/statuses/{status_id}')    
async def delete_status(status_id: str, db: Session = Depends(get_db)):
    db_item = db.get(Status, status_id)

    if not db_item:
        raise HTTPException(
            status_code=400,
            detail='Could not find tag',
        )

    db.delete(db_item)
    db.commit() 

    return None

@app.delete('/admin/links/{link_id}')
async def delete_link(link_id: str, db: Session = Depends(get_db)):
    db_item = db.get(Link, link_id)

    if not db_item:
        raise HTTPException(
            status_code=400,
            detail='Could not find tag',
        )

    db.delete(db_item)
    db.commit() 

    return None


# AWS Lambda handler
from mangum import Mangum
handler = Mangum(app)