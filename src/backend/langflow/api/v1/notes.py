from typing import List
from uuid import UUID
from langflow.api.utils import remove_api_keys
from langflow.api.v1.schemas import NoteListCreate, NoteListRead

from langflow.services.database.models.note import (
    Note,
    NoteModel,
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



NOTE_NOT_FOUND = "Note not found"
NOTE_ALREADY_EXISTS = "A Note with the same id already exists."
NOTE_DELETED = "Note deleted"
# build router
router = APIRouter(prefix="/notes", tags=["Notes"])

@router.post("/", response_model=Note)
def create_note(note: NoteModel, db: Session = Depends(get_session)):
    db_note = Note(**note.dict())
    try:
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
    except IntegrityError as e:
        print(e)
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="NOTE_ALREADY_EXISTS",
        ) from e
    return db_note


@router.get("/all/{user_id}", response_model=List[Note])
def read_notes(user_id:str, db: Session = Depends(get_session)):
    """Get all notes"""
    try:
        # notes = db.exec(select(Folder)).all()
        # print("user_id:",user_id)
        notes = db.query(Note).filter(Note.user_id ==user_id ).all()
        # print("notes:",notes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return [jsonable_encoder(note) for note in notes]

@router.patch("/{note_id}", response_model=Note)
def update_note(
    note_id: UUID, note: NoteModel, db: Session = Depends(get_session)
):
    db_note = db.get(Note, note_id)
    if not db_note:
        raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND)
    note_data = note.dict(exclude_unset=True)

    for key, value in note_data.items():
        setattr(db_note, key, value)

    # db_note.update_at = datetime.now(timezone.utc)
    db_note.update_at = datetime.now()
    db.commit()
    db.refresh(db_note)
    return db_note


@router.delete("/{note_id}")
def delete_note(note_id: UUID, db: Session = Depends(get_session)):
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail=NOTE_NOT_FOUND)
    db.delete(note)
    db.commit()
    return {"detail":NOTE_DELETED}

@router.get("/download/{user_id}", response_model=NoteListRead, status_code=200)
async def download_file(user_id:str, db: Session = Depends(get_session)):
    """Download all notes as a file."""
    notes = read_notes(user_id,db=db)
    return NoteListRead(notes=notes)

def create_notes(*, session: Session = Depends(get_session), note_list: NoteListCreate):
    """Create multiple new notes."""
    db_notes = []
    for note in note_list.notes:
        db_note = Note.from_orm(note)
        session.add(db_note)
        db_notes.append(db_note)
    session.commit()
    for db_note in db_notes:
        session.refresh(db_note)
    return db_notes