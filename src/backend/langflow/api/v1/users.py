from typing import List
from uuid import UUID
from langflow.api.utils import remove_api_keys
from langflow.api.v1.schemas import FlowListCreate, FlowListRead
from langflow.services.database.models.user import (
    User,
    UserModel
)
from langflow.services.utils import get_session
from langflow.services.utils import get_settings_manager
from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder

# build router
router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=User)
def user_login(user:UserModel, db: Session = Depends(get_session)):
    db_user = User(**user.dict())
    try:
        
        db_id = db.execute('select id from user where name=:name and password=:password',{"name":user.name,"password":user.password}).fetchone()
        if(db_id):
            db_user.password="******"

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return db_user