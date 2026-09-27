from datetime import datetime
import string

from pydantic import BaseModel, ConfigDict

# --- Schema --- 

class PostModel(BaseModel):
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
    posts: list[PostModel]

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
