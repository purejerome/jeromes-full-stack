from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.tests.utils.meeting import create_random_meeting


def test_create_meeting(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": "Foo", "agenda": "Fighters", "summary": "fight on"}
    response = client.post(
        f"{settings.API_V1_STR}/meetings/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["agenda"] == data["agenda"]
    assert content["summary"] == data["summary"]
    assert "id" in content


def test_read_meeting(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    meeting = create_random_meeting(db)
    response = client.get(
        f"{settings.API_V1_STR}/meetings/{meeting.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == meeting.title
    assert content["agenda"] == meeting.agenda
    assert content["summary"] == meeting.summary
    assert content["id"] == meeting.id


def test_read_meeting_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/meetings/{-1}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_read_item_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    meeting = create_random_meeting(db)
    response = client.get(
        f"{settings.API_V1_STR}/meetings/{meeting.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"
    
# def test_read_item_not_enough_permissions2(
#     client: TestClient, normal_user_token_headers: dict[str, str], db: Session
# ) -> None:
#     meeting = create_random_meeting(db)
#     response = client.get(
#         f"{settings.API_V1_STR}/meetings/",
#         headers=normal_user_token_headers,
#     )
#     assert response.status_code == 200
#     content = response.json()
#     print("*************\n")
#     print(meeting)
#     print("\n")
#     print(content)
#     print("\n")
#     print(content["data"])
#     print("\n*************\n")
#     for meet in content["data"]:
#         assert meet["owner_id"] == meeting.owner_id
#     # assert content["detail"] == "Not enough permissions"

def test_read_meetings(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_meeting(db)
    create_random_meeting(db)
    response = client.get(
        f"{settings.API_V1_STR}/meetings/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2


def test_update_meeting(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    meeting = create_random_meeting(db)
    data = {"agenda": "Updated agenda", "summary": "Updated summary", "title": "Updated title"}
    response = client.put(
        f"{settings.API_V1_STR}/meetings/{meeting.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["agenda"] == data["agenda"]
    assert content["summary"] == data["summary"]
    assert content["id"] == meeting.id
    assert content["title"] == data["title"]


def test_update_meeting_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"agenda": "Updated agenda", "summary": "Updated summary", "title": "Updated title"}
    response = client.put(
        f"{settings.API_V1_STR}/meetings/{-1}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_update_meeting_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    meeting = create_random_meeting(db)
    data = {"title": "Updated title", "description": "Updated description"}
    response = client.put(
        f"{settings.API_V1_STR}/meetings/{meeting.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_meeting(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    meeting = create_random_meeting(db)
    response = client.delete(
        f"{settings.API_V1_STR}/meetings/{meeting.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Item deleted successfully"


def test_delete_meeting_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/meetings/{-1}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Item not found"


def test_delete_item_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    meeting = create_random_meeting(db)
    response = client.delete(
        f"{settings.API_V1_STR}/meetings/{meeting.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"
