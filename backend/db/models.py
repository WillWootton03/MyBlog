import uuid

from typing import List

from sqlalchemy import Date, ForeignKey, LargeBinary, String, Uuid, text, func
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

from datetime import datetime

Base = declarative_base()

# --- Models ---

class Post(Base):
    __tablename__ = 'posts'

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, server_default=text("gen_random_uuid()"))
    date: Mapped[datetime] = mapped_column(Date)
    link: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    body: Mapped[str] = mapped_column(String)

    tag_id: Mapped[str] = mapped_column(ForeignKey('tags.id'))
    tag: Mapped["Tag"] = relationship(back_populates='posts')


class Tag(Base):
    __tablename__ = 'tags'

    id: Mapped[str] = mapped_column(String, primary_key=True)
    posts: Mapped[List["Post"]] = relationship(back_populates='tag')

class Status(Base):
    __tablename__ = 'statuses'

    title: Mapped[str] = mapped_column(String, primary_key=True)
    body: Mapped[str] = mapped_column(String)

class Details(Base):
    __tablename__ = 'details'

    image_data: Mapped[bytes] = mapped_column(LargeBinary)
    bio: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), primary_key=True)