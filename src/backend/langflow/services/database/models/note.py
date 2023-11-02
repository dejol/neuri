from langflow.services.database.models.base import SQLModelSerializable, SQLModel
from sqlmodel import Field, JSON, Column
from typing import Optional,Dict
from datetime import datetime
import uuid

class NoteBase(SQLModelSerializable):
    name: str = Field(index=True)
    folder_id: str = Field(default="",index=True)
    user_id:str = Field(default="",index=True)
    is_disabled: bool=Field(default=False)
    content: Optional[Dict] = Field(default=None, sa_column=Column(JSON))


class Note(NoteBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    create_at: datetime = Field(default_factory=datetime.now)
    update_at: datetime = Field(default_factory=datetime.now)


class NoteModel(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    name: str = Field(default="")
    content: Optional[Dict] = Field(default=None)
    folder_id: str = Field(default="",index=True)
    user_id: str = Field(default="",index=True)

class NoteRead(NoteBase):
    id: uuid.UUID       

class NoteCreate(NoteBase):
    pass   