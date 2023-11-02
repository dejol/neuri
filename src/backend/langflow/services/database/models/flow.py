# Path: src/backend/langflow/database/models/flow.py

from datetime import datetime
from langflow.services.database.models.base import SQLModelSerializable
from pydantic import validator
from sqlmodel import Field, JSON, Column
from uuid import UUID, uuid4
from typing import Dict, Optional

# if TYPE_CHECKING:


class FlowBase(SQLModelSerializable):
    folder_id:str=Field(default="")
    user_id:str=Field(default="")
    name: str = Field(index=True)
    description: Optional[str] = Field(index=True)
    data: Optional[Dict] = Field(default=None)

    @validator("data")
    def validate_json(v):
        # dict_keys(['description', 'name', 'id', 'data'])
        if not v:
            return v
        if not isinstance(v, dict):
            raise ValueError("Flow must be a valid JSON")

        # data must contain nodes and edges
        if "nodes" not in v.keys():
            raise ValueError("Flow must have nodes")
        if "edges" not in v.keys():
            raise ValueError("Flow must have edges")

        return v


class Flow(FlowBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True, unique=True)
    data: Optional[Dict] = Field(default=None, sa_column=Column(JSON))
    create_at: datetime = Field(default_factory=datetime.now)
    update_at: datetime = Field(default_factory=datetime.now)

class FlowCreate(FlowBase):
    pass


class FlowRead(FlowBase):
    id: UUID
    create_at: datetime
    update_at: datetime


class FlowUpdate(SQLModelSerializable):
    folder_id:str=""
    user_id:str=""
    name: Optional[str] = None
    description: Optional[str] = None
    data: Optional[Dict] = None
