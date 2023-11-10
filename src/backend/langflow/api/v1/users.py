from datetime import datetime
from typing import List
from uuid import UUID
from langflow.api.v1.flows import create_flows
from langflow.api.v1.notes import create_notes
from langflow.api.utils import remove_api_keys
from langflow.api.v1.schemas import FlowListCreate, FlowListRead,FlowCreate, FolderListCreate,NoteListCreate,UsersResponse
from langflow.services.database.models.user import (
    User,
    UserCreate,
    UserRead,
    UserUpdate,
)
from langflow.services.utils import get_session
from langflow.services.utils import get_settings_manager
from langflow.api.v1.folders import create_folders
from sqlmodel import Session, select
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi import File, UploadFile
import json
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError

# from langflow.services.getters import get_session, get_settings_service
from langflow.services.auth.utils import (
    get_current_active_superuser,
    get_current_active_user,
    get_password_hash,
    verify_password,
)
from langflow.services.database.models.user.crud import (
    get_user_by_id,
    update_user,
)

# build router
router = APIRouter(prefix="/users", tags=["Users"])
@router.post("/", response_model=UserRead, status_code=201)
def add_user(
    user: UserCreate,
    session: Session = Depends(get_session),
    settings_manager=Depends(get_settings_manager),
) -> User:
    """
    Add a new user to the database.
    """
    new_user = User.from_orm(user)
    try:
        new_user.password = get_password_hash(user.password)
        new_user.is_active = settings_manager.auth_settings.NEW_USER_IS_ACTIVE
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
    except IntegrityError as e:
        session.rollback()
        print(e)
        raise HTTPException(
            status_code=400, detail="This username is unavailable."
        ) from e

    return new_user

@router.get("/whoami", response_model=UserRead)
def read_current_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Retrieve the current user's data.
    """
    
    return current_user


@router.get("/", response_model=UsersResponse)
def read_all_users(
    skip: int = 0,
    limit: int = 10,
    _: Session = Depends(get_current_active_superuser),
    session: Session = Depends(get_session),
) -> UsersResponse:
    """
    Retrieve a list of users from the database with pagination.
    """
    query = select(User).offset(skip).limit(limit)
    users = session.execute(query).fetchall()

    count_query = select(func.count()).select_from(User)  # type: ignore
    total_count = session.execute(count_query).scalar()

    return UsersResponse(
        total_count=total_count,  # type: ignore
        users=[UserRead(**dict(user.User)) for user in users],
    )


@router.patch("/{user_id}", response_model=UserRead)
def patch_user(
    user_id: UUID,
    user_update: UserUpdate,
    user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> User:
    """
    Update an existing user's data.
    """
    if not user.is_superuser and user.id != user_id:
        raise HTTPException(
            status_code=403, detail="You don't have the permission to update this user"
        )
    if user_update.password:
        if not user.is_superuser:
            raise HTTPException(
                status_code=400, detail="You can't change your password here"
            )
        user_update.password = get_password_hash(user_update.password)

    if user_db := get_user_by_id(session, user_id):
        return update_user(user_db, user_update, session)
    else:
        raise HTTPException(status_code=404, detail="User not found")


@router.patch("/{user_id}/reset-password", response_model=UserRead)
def reset_password(
    user_id: UUID,
    user_update: UserUpdate,
    user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
) -> User:
    """
    Reset a user's password.
    """
    if user_id != user.id:
        raise HTTPException(
            status_code=400, detail="You can't change another user's password"
        )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if verify_password(user_update.password, user.password):
        raise HTTPException(
            status_code=400, detail="You can't use your current password"
        )
    new_password = get_password_hash(user_update.password)
    user.password = new_password
    session.commit()
    session.refresh(user)

    return user


@router.delete("/{user_id}", response_model=dict)
def delete_user(
    user_id: UUID,
    current_user: User = Depends(get_current_active_superuser),
    session: Session = Depends(get_session),
) -> dict:
    """
    Delete a user from the database.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400, detail="You can't delete your own user account"
        )
    elif not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="You don't have the permission to delete this user"
        )

    user_db = session.query(User).filter(User.id == user_id).first()
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user_db)
    session.commit()

    return {"detail": "User deleted"}


# @router.post("/", response_model=UserRead)
# def user_login(user:UserCreate, db: Session = Depends(get_session)):
#     # db_user = UserModel(**user.dict())
#     print("user:",user)
#     try:
#         # db_id = db.execute('select id from user where name=:name and password=:password',{"name":user.name,"password":user.password}).fetchone()
#         query = db.query(User).filter(User.username == user.username, User.password == user.password).first()
#         if(query):
#             returnUser=UserRead(
#                 password="******",
#                 username=user.username,
#                 id=str(query.id),
#                 is_active=query.is_active,
#                 is_superuser=query.is_superuser,
#                 create_at=query.create_at,
#                 update_at=query.update_at                
#             )
#             # returnUser.password="******"
#             # returnUser.username=user.username
#             # returnUser.id=str(query.id)


#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e)) from e
#     return returnUser

@router.post("/restore", status_code=201)
async def upload_file(
    *, session: Session = Depends(get_session), file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload note data from a file."""
    contents = await file.read()
    data = json.loads(contents)
    if("userId" in data and str(current_user.id)==data["userId"]):
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