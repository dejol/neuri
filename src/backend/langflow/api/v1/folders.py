from typing import List
from uuid import UUID
from langflow.api.utils import remove_api_keys

from langflow.services.database.models.folder import (
    Folder,
    FolderModel,
)
from langflow.services.utils import get_session
from langflow.services.utils import get_settings_manager
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
def create_folder(folder: FolderModel, db: Session = Depends(get_session)):
    db_folder = Folder(**folder.dict())
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
def read_folders(*, db: Session = Depends(get_session)):
    try:
        folders = db.exec(select(Folder)).all()
    except Exception as e:
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

