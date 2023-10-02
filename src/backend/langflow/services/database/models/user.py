from langflow.services.database.models.base import SQLModelSerializable, SQLModel
from sqlmodel import Field
from typing import Optional
from datetime import datetime
import uuid


class User(SQLModelSerializable, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    password: Optional[str] = Field(default=None)
    create_at: datetime = Field(default_factory=datetime.utcnow)
    update_at: datetime = Field(default_factory=datetime.utcnow)


class UserModel(SQLModel):
    id: str = Field(default="")
    name: str = Field(default="")
    password: Optional[str] = None
