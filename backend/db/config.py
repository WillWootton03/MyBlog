import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DB_DIR = '/data'
DB_PATH = f'{DB_DIR}/app.db'
os.makedirs(DB_DIR, exist_ok=True)

URL = f'sqlite:///{DB_PATH}'
ARGS = {"check_same_thread": False}


engine = create_engine(URL, connect_args=ARGS)

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