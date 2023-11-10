from typing import List
from uuid import UUID
from langflow.api.utils import remove_api_keys
from langflow.services.auth.utils import get_current_active_user
from langflow.services.database.models.folder import (
    Folder,
    FolderModel,FolderRead
)
from langflow.api.v1.schemas import  FolderListCreate, FolderListRead
from langflow.services.utils import get_session
from langflow.services.utils import get_settings_manager
from langflow.services.database.models.user.user import User

from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.exc import IntegrityError
from fastapi import File, UploadFile
import json
from datetime import timezone
from datetime import datetime



FOLDER_NOT_FOUND = "Folder not found"
FOLDER_ALREADY_EXISTS = "A Folder with the same id already exists."
FOLDER_DELETED = "Folder deleted"
# build router
router = APIRouter(prefix="/folders", tags=["Folders"])

@router.post("/", response_model=Folder)
def create_folder(folder: FolderModel, db: Session = Depends(get_session),current_user: User = Depends(get_current_active_user)):
    db_folder = Folder(**folder.dict())
    db_folder.user_id=str(current_user.id)
    try:
        db.add(db_folder)
        db.commit()
        db.refresh(db_folder)
    except IntegrityError as e:
        print(e)
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="FOLDER_ALREADY_EXISTS",
        ) from e
    return db_folder


@router.get("/", response_model=List[Folder])
def read_folders(*, db: Session = Depends(get_session),
                 current_user: User = Depends(get_current_active_user)):
    """Get all folders"""
    try:
        # folders = db.exec(select(Folder)).all()
        
        folders = db.query(Folder).filter(Folder.user_id ==str(current_user.id) ).all()
        # print("folders:",folders)
    except Exception as e:
        # print("FolderError:",e)
        raise HTTPException(status_code=500, detail=str(e)) from e
    return [jsonable_encoder(folder) for folder in folders]

@router.patch("/{folder_id}", response_model=Folder)
def update_folder(
    folder_id: UUID, folder: FolderModel, db: Session = Depends(get_session)
):
    db_folder = db.get(Folder, folder_id)
    if not db_folder:
        raise HTTPException(status_code=404, detail=FOLDER_NOT_FOUND)
    folder_data = folder.dict(exclude_unset=True)

    for key, value in folder_data.items():
        setattr(db_folder, key, value)

    db_folder.update_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_folder)
    return db_folder


@router.delete("/{folder_id}")
def delete_folder(folder_id: UUID, db: Session = Depends(get_session)):
    folder = db.get(Folder, folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail=FOLDER_NOT_FOUND)
    db.delete(folder)
    db.commit()
    return {"detail":FOLDER_DELETED}

@router.get("/download/", response_model=FolderListRead, status_code=200)
async def download_file( db: Session = Depends(get_session),
                        current_user: User = Depends(get_current_active_user)):
    """Download all folders as a file."""
    folders = read_folders(db=db,current_user=current_user)
    return FolderListRead(folders=folders)

def create_folders(*, session: Session = Depends(get_session), folder_list: FolderListCreate
                   ,current_user: User = Depends(get_current_active_user)):
    """Create multiple new folders."""
    db_folders = []
    for folder in folder_list.folders:
        folder.user_id=str(current_user.id)
        db_folder = Folder.from_orm(folder)
        session.add(db_folder)
        db_folders.append(db_folder)
    session.commit()
    for db_folder in db_folders:
        session.refresh(db_folder)
    return db_folders