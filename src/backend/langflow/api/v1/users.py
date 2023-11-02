from typing import List
from uuid import UUID
from langflow.api.v1.flows import create_flows
from langflow.api.v1.notes import create_notes
from langflow.api.utils import remove_api_keys
from langflow.api.v1.schemas import FlowListCreate, FlowListRead,FlowCreate, FolderListCreate,NoteListCreate
from langflow.services.database.models.user import (
    User,
    UserModel
)
from langflow.services.utils import get_session
from langflow.services.utils import get_settings_manager
from langflow.api.v1.folders import create_folders
from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi import File, UploadFile
import json
# build router
router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserModel)
def user_login(user:UserModel, db: Session = Depends(get_session)):
    # db_user = UserModel(**user.dict())
    try:
        # db_id = db.execute('select id from user where name=:name and password=:password',{"name":user.name,"password":user.password}).fetchone()
        query = db.query(User).filter(User.name == user.name, User.password == user.password).first()
        if(query):
            user.password="******"
            user.id=str(query.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return user

@router.post("/restore/{user_id}", status_code=201)
async def upload_file(
    *, session: Session = Depends(get_session),user_id:str, file: UploadFile = File(...)
):
    """Upload note data from a file."""
    contents = await file.read()
    data = json.loads(contents)
    if("userId" in data and user_id==data["userId"]):
        if "folders" in data:
            folder_list = FolderListCreate(**data)
            create_folders(session=session, folder_list=folder_list)        
        if "flows" in data:
            flow_list = FlowListCreate(**data)
            create_flows(session=session, flow_list=flow_list)
        # else:
        #     # flow_list = FlowListCreate(flows=[FlowCreate(**flow) for flow in data])

        if "notes" in data:
            note_list = NoteListCreate(**data)
            create_notes(session=session, note_list=note_list)            
      
    else:
         return {"message":"UserId is not matched","status":501}

    return {"message": "Restore successfully","status":201}