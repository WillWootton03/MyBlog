import uuid

from typing import List, Optional

from sqlalchemy import ForeignKey, String, Uuid, func, DateTime
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

from datetime import datetime

Base = declarative_base()

# --- Models ---

class Post(Base):
    __tablename__ = 'posts'

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    link: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    body: Mapped[str] = mapped_column(String)

    tag_id: Mapped[str] = mapped_column(ForeignKey('tags.id'))
    tag: Mapped["Tag"] = relationship(back_populates='posts')


class Tag(Base):
    __tablename__ = 'tags'

    id: Mapped[str] = mapped_column(String, primary_key=True)
    posts: Mapped[List["Post"]] = relationship(back_populates='tag', cascade='all, delete-orphan')

class Status(Base):
    __tablename__ = 'statuses'

    title: Mapped[str] = mapped_column(String, primary_key=True)
    body: Mapped[str] = mapped_column(String)

class Link(Base):
    __tablename__ = 'links'

    display: Mapped[str] = mapped_column(String, primary_key=True)
    external_link: Mapped[str] = mapped_column(String)


class Details(Base):
    __tablename__ = 'details'

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    image_data: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    bio: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())