from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Meeting,
    MeetingCreate,
    MeetingPublic,
    MeetingsPublic,
    MeetingUpdate,
    Message,
)

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.get("/", response_model=MeetingsPublic)
def read_items(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve items.
    """ 
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Meeting)
        count = session.exec(count_statement).one()
        statement = select(Meeting).offset(skip).limit(limit)
        meetings = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Meeting)
            .where(Meeting.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Meeting)
            .where(Meeting.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        meetings = session.exec(statement).all()

    return MeetingsPublic(data=meetings, count=count)


@router.get("/{id}", response_model=MeetingPublic)
def read_item(session: SessionDep, current_user: CurrentUser, id: int) -> Any:
    """
    Get item by ID.
    """
    meeting = session.get(Meeting, id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (meeting.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return meeting


@router.post("/", response_model=MeetingPublic)
def create_item(
    *, session: SessionDep, current_user: CurrentUser, item_in: MeetingCreate
) -> Any:
    """
    Create new item.
    """
    # meeting = Meeting.model_validate(item_in, update={"owner_id": current_user.id})
    meeting = Meeting.model_validate(item_in, update={"owner_id": current_user.id})
    # meeting = Meeting(title=meeting_in.title, agenda=meeting_in.agenda, summary=meeting_in.summary)
    # meeting = Meeting(**meeting_in.dict())
    session.add(meeting)
    session.commit()
    session.refresh(meeting)
    return meeting


@router.put("/{id}", response_model=MeetingPublic)
def update_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: int,
    item_in: MeetingUpdate,
) -> Any:
    """
    Update an item.
    """
    meeting = session.get(Meeting, id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (meeting.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = item_in.model_dump(exclude_unset=True)
    meeting.sqlmodel_update(update_dict)
    session.add(meeting)
    session.commit()
    session.refresh(meeting)
    return meeting


@router.delete("/{id}")
def delete_item(
    session: SessionDep, current_user: CurrentUser, id: int
) -> Message:
    """
    Delete an item.
    """
    meeting = session.get(Meeting, id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (meeting.owner_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(meeting)
    session.commit()
    return Message(message="Item deleted successfully")
