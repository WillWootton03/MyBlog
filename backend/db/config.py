import os
from dotenv import load_dotenv
import boto3

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL is None:
    raise RuntimeError('DATABASE_URL is not set')

engine = create_engine(DATABASE_URL)

s3 = boto3.client('s3')
S3_BUCKET = os.getenv('S3_BUCKET')

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()