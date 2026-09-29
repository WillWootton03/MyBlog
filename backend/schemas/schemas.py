from datetime import datetime
import string
import uuid
from typing import Optional

from pydantic import BaseModel, ConfigDict

# --- Schema --- 

class PostModel(BaseModel):
    id: uuid.UUID
    date: datetime
    link: str
    title: str
    body: str
    tag_id: str

    model_config = ConfigDict(
        from_attributes=True
    )

class TagModel(BaseModel):
    id: str
    posts: Optional[list[PostModel]] = []

    model_config = ConfigDict(
        from_attributes=True
    )

class StatusModel(BaseModel):
    title: str
    body: str

    model_config = ConfigDict(
        from_attributes=True
    )

class DetailsModel(BaseModel):
    image_data: bytes
    bio: str
    email: str
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )

class LinksModel(BaseModel):
    display: str
    external_link: str

    model_config = ConfigDict(
        from_attributes=True
    )

class UpdateLinkModel(BaseModel):
    display: str | None = None
    external_link: str | None = None
    
    model_config = ConfigDict(
        from_attributes=True
    )

class CreatePostResponse(BaseModel):
    tag: TagModel | None = None
    post: PostModel