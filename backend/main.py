import uuid
import os

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from db.models import Base, Post, Tag, Status, Details
from db.config import get_db, engine
from schemas.schemas import PostModel, TagModel, StatusModel, DetailsModel

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
    path = req.url.path
    path = path.rstrip('/')
    if path.startswith('/admin') and not path.startswith('/admin/login'):
        if req.headers.get('X-Admin-Key') == ADMIN_SECURE_KEY:
            return await call_next(req)

        return RedirectResponse(url='/', status_code=307)

    return await call_next(req)

        
PAGE_SIZE = 5

@app.get('/posts/')
async def all_posts(page: int = Query(1, ge=1), db: Session = Depends(get_db)):
    offset = (page - 1) * PAGE_SIZE

    stmt = select(Post).order_by(Post.date.desc()).limit(PAGE_SIZE).offset(offset)
    res = db.scalars(stmt).all()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='No Posts found'
        )

    return res

@app.get('/posts/{post_id}', response_model=PostModel)
async def get_post(post_id: uuid.UUID, db: Session = Depends(get_db)):
    stmt = select(Post).where(Post.id == post_id)
    res = db.scalars(stmt).first()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='Post not found',
        )

    return res

@app.get('/posts/tags/{tag_id}')
async def get_posts_by_tag(tag_id: str, page: int = Query(1, ge=1), db: Session = Depends(get_db)):

    offset = (page - 1) * PAGE_SIZE

    stmt = select(Post).where(Post.tag_id == tag_id).order_by(Post.date.desc()).limit(5).offset(offset)
    res = db.scalars(stmt).all()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='Posts with that tag not found',
        )   

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
    stmt = select(Details).order_by(Details.updated_at.desc())
    res = db.scalars(stmt).first()

    if not res:
        raise HTTPException(
            status_code=404,
            detail='No details found'
        )
    return res


# --- ADMIN METHODS --- 

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD')
ADMIN_SECURE_KEY = os.environ.get('ADMIN_SECURE_KEY')

@app.post('/admin/login')
async def admin_login(payload: dict):
    print(payload.get('password'))
    if payload.get('password') != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=401,
            detail='Invalid Login'
        )
    return { 'admin_key': ADMIN_SECURE_KEY }

@app.post('admin/tags', response_model=TagModel, status_code=201)
async def create_tag(tag_id: str, db: Session = Depends(get_db)):

    db_post = Tag(
        id=tag_id
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

@app.post('admin/posts', response_model=PostModel, status_code=201)
async def create_post(payload: PostModel, db: Session = Depends(get_db)):
    tag_stmt = select(Tag).where(Tag.id == payload.tag_id) 
    if not db.scalars(tag_stmt).first():
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
        date=payload.date,
        link=payload.link,
        title=payload.title,
        body=payload.body,
        tag_id=payload.tag_id,
    )

    db.add(db_post)
    db.commit() 
    db.refresh(db_post)
    return db_post
