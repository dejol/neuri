from langflow.services.database.models.base import SQLModelSerializable, SQLModel
from sqlmodel import Field
from typing import Optional
from datetime import datetime
import uuid


class FolderBase(SQLModelSerializable):
    name: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    user_id:str = Field(default="",index=True)
    parent_id: str = Field(default="",index=True)
    is_disabled: bool=Field(default=False)

class Folder(FolderBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    create_at: datetime = Field(default_factory=datetime.utcnow)
    update_at: datetime = Field(default_factory=datetime.utcnow)


class FolderModel(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str = Field(default="")
    description: Optional[str] = None
    parent_id: str = Field(default="",index=True)
    user_id: str = Field(default="",index=True)

class FolderRead(FolderBase):
    id: uuid.UUID    

class FolderCreate(FolderBase):
    pass    