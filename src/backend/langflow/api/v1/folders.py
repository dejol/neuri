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

# @router.get("/{folder_id}", response_model=FolderRead, status_code=200)
# def read_folder(*, session: Session = Depends(get_session), folder_id: UUID):
#     """Read a folder."""
#     if folder := session.get(Folder, folder_id):
#         return folder
#     else:
#         raise HTTPException(status_code=404, detail="Folder not found")


# @router.patch("/{folder_id}", response_model=FolderRead, status_code=200)
# def update_folder(
#     *, session: Session = Depends(get_session), folder_id: UUID, folder: FolderUpdate
# ):
#     """Update a folder."""

#     db_folder = session.get(Folder, folder_id)
#     if not db_folder:
#         raise HTTPException(status_code=404, detail="folder not found")
#     folder_data = folder.dict(exclude_unset=True)
#     settings_manager = get_settings_manager()
#     if settings_manager.settings.REMOVE_API_KEYS:
#         folder_data = remove_api_keys(folder_data)
#     for key, value in folder_data.items():
#         setattr(db_folder, key, value)
#     session.add(db_folder)
#     session.commit()
#     session.refresh(db_folder)
#     return db_folder


# @router.delete("/{folder_id}", status_code=200)
# def delete_folder(*, session: Session = Depends(get_session), folder_id: UUID):
#     """Delete a folder."""
#     folder = session.get(Folder, folder_id)
#     if not folder:
#         raise HTTPException(status_code=404, detail="folder not found")
#     session.delete(folder)
#     session.commit()
#     return {"message": "folder deleted successfully"}

