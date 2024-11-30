from fastapi import FastAPI, HTTPException
from firebase_config import firestore_client
from firebase_config import realtime_db
from pydantic import BaseModel
from typing import List
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="My API with Response Models",
    description="This API demonstrates how to define response types using response_model.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    name: str
    price: float
    description: str = None

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str = None

class UserModel(BaseModel):
    Name: str
    RoomID: str
    UserID: str

# Firestore�� ������ �߰�
"""
User API START
"""
@app.post("/firebase/User/", tags=["User"], summary="Create an User", response_model=UserModel)
async def add_user(data: UserModel):
    """
    Add an User to Firestore.
    """
    # UserID duplication Check
    user_query = firestore_client.collection("User").where("UserID", "==", data.UserID).stream()
    for _ in user_query:
        raise HTTPException(status_code=400, detail="UserID already exists in the User collection")
    
    # Add data in FireStore
    doc_ref = firestore_client.collection("User").document()
    if(not data.Name):
        raise HTTPException(status_code=404, detail="data not include UserName")
    if(not data.UserID):
        raise HTTPException(status_code=404, detail="UserID not found")
    doc_ref.set(data.dict())
    return {"message": "Item added successfully", "id": doc_ref.id, **data.dict()}

# Firestore���� ������ ��ȸ
@app.get("/firebase/User/{user_id}", tags=["User"], summary="Get User by UserID", response_model=UserModel)
async def get_user(user_id: str):
    """
    Retrieve an User from Firestore by ID.
    """
    try:
        # UserID�� ������� Firestore���� ����� ��ȸ
        user_query = firestore_client.collection("User").where("UserID", "==", user_id).stream()

        # ��� ó��
        user_data = None
        for doc in user_query:
            user_data = doc.to_dict()  # ù ��° ����� �����ɴϴ�.
            break  # UserID�� �����ϴٰ� �����ϹǷ� �ϳ��� ����� �����ɴϴ�.

        # ����� ���� ���� Ȯ��
        if not user_data:
            raise HTTPException(status_code=404, detail=f"User with UserID '{user_id}' not found")

        return user_data  # ��ȸ�� ����� ������ ��ȯ
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/firebase/User/{item_id}", tags=["User"])
async def update_user(item_id: str, update_data: dict):
    """
    Update a document in a Firestore User.
    """
    try:
        doc_ref = firestore_client.collection("Room").document(item_id)

        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Document not found")
        
        doc_ref.update(update_data)
        return update_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
User API END
"""
class RoomModel(BaseModel):
    MaxUser: int = 8   # �ִ� ���� ��
    Name: str       # �� �̸�
    RoomID: str     # �� ID
    RoomState: bool = False # �� ���� (True: ���� ����, False: ���� ���)
    RoomHostID: str # ���� (�� ó�� ������ ���� ID)
    UserList: List[str] = []# ���� ����Ʈ (UserID �迭)
    ChatID: str = None # �� ���� �� ChatID�� ����
"""
Room API START
"""
@app.post("/firebase/Room/", tags=["Room"], summary="Create a Game Room", response_model=RoomModel)
async def add_room(data: RoomModel):
    """
    Create a new game room and set the creator as the Room Host.
    """
    # Check essential field
    if not data.Name:
        raise HTTPException(status_code=400, detail="Room Name cannot be empty")
    if not data.RoomID:
        raise HTTPException(status_code=400, detail="Room ID cannot be empty")

    try:
        # RoomID �ߺ� ���� Ȯ��
        room_query = firestore_client.collection("Room").document(data.RoomID).get()
        if room_query.exists:
            raise HTTPException(status_code=400, detail=f"Room with ID '{data.RoomID}' already exists")

        # Chat ���� ���� (�濡�� ����� ä�� ����)
        chat_ref = firestore_client.collection("Chat").document()
        chat_id = chat_ref.id # ���̾�信�� �ڵ� ������ ID��

        chat_data = {
            "ChatID": chat_id, # ä�� �ڷ� ID
            "RoomID": data.RoomID, # �� ID
            "Messages": [], # �޽��� �迭
        }
        chat_ref.set(chat_data)

        # �ʱ�ȭ �� ����
        room_data = {
            "MaxUser": data.MaxUser,
            "Name": data.Name,
            "RoomID": data.RoomID,
            "RoomState": False,  # �׻� False�� �ʱ�ȭ
            "RoomHostID": data.RoomHostID,
            "UserList": [data.RoomHostID],  # ������ UserList�� �ڵ����� �߰�
            "ChatID": chat_id,
        }

        # Firestore�� ����
        firestore_client.collection("Room").document(data.RoomID).set(room_data)

        return room_data  # ���������� ������ �� ������ ��ȯ
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Firestore���� ��� �濡 ���� ������ ��������
@app.get("/firebase/Room/", tags=["Room"], summary="Get ALL Rooms", response_model=List[RoomModel])
async def get_all_rooms():
    """
    Retrieve all game rooms from Firestore.
    """
    try:
        # Firestore���� ��� �� ������ ��������
        rooms_query = firestore_client.collection("Room").stream()

        # ��� ����
        rooms = [doc.to_dict() for doc in rooms_query]

        # ���� ���� ���
        if not rooms:
            raise HTTPException(status_code=404, detail="No rooms found")

        return rooms  # �� ������ ����Ʈ ��ȯ
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/firebase/Room/{room_id}/start", tags=["Room"], summary="Start Game and Reset Chat")
async def start_game(room_id: str):
    """
    Start the game by setting RoomState to True and clearing chat messages.
    """
    try:
        # Firestore���� Room ���� ��������
        room_ref = firestore_client.collection("Room").document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # RoomState�� True�� ����
        room_data = room_doc.to_dict()
        room_data["RoomState"] = True
        room_ref.update({"RoomState": True})

        # ChatID ��������
        chat_id = room_data.get("ChatID")
        if not chat_id:
            raise HTTPException(status_code=404, detail=f"Chat not found for Room '{room_id}'")

        # Firestore���� Chat ���� ��������
        chat_ref = firestore_client.collection("Chat").document(chat_id)
        chat_doc = chat_ref.get()

        if not chat_doc.exists:
            raise HTTPException(status_code=404, detail=f"Chat with ID '{chat_id}' not found")

        # ä�� �ʱ�ȭ (Messages �迭 ����)
        chat_ref.update({"Messages": []})

        return {"message": f"Game started for Room '{room_id}', chat has been reset"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/firebase/Room/{room_id}/end", tags=["Room"], summary="End Game and Reset Chat")
async def end_game(room_id: str):
    """
    End the game by setting RoomState to False and clearing chat messages.
    """
    try:
        # Firestore���� Room ���� ��������
        room_ref = firestore_client.collection("Room").document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # RoomState�� False�� ����
        room_data = room_doc.to_dict()
        room_data["RoomState"] = False
        room_ref.update({"RoomState": False})

        # ChatID ��������
        chat_id = room_data.get("ChatID")
        if not chat_id:
            raise HTTPException(status_code=404, detail=f"Chat not found for Room '{room_id}'")

        # Firestore���� Chat ���� ��������
        chat_ref = firestore_client.collection("Chat").document(chat_id)
        chat_doc = chat_ref.get()

        if not chat_doc.exists:
            raise HTTPException(status_code=404, detail=f"Chat with ID '{chat_id}' not found")

        # ä�� �ʱ�ȭ (Messages �迭 ����)
        chat_ref.update({"Messages": []})

        return {"message": f"Game ended for Room '{room_id}', chat has been reset"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/firebase/Room/{room_id}/leave", tags=["Room"], summary="Leave a Room")
async def leave_room(room_id: str, user_id: str):
    """
    Remove a user from the UserList of a room and update the Room information.
    """
    try:
        # Firestore���� �ش� Room ��������
        doc_ref = firestore_client.collection("Room").document(room_id)
        room_doc = doc_ref.get()

        # �� ���� ���� Ȯ��
        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # �� ������ ��������
        room_data = room_doc.to_dict()
        user_list = room_data.get("UserList", [])

        # ������ UserList�� �ִ��� Ȯ��
        if user_id not in user_list:
            raise HTTPException(status_code=400, detail=f"User '{user_id}' is not in the room")

        # ������ UserList���� ����
        user_list.remove(user_id)

        # ������ ���� ���� ��� ó��
        if room_data.get("RoomHostID") == user_id:
            if user_list:
                # �����ִ� ���� �� ù ��° ������ �������� ����
                room_data["RoomHostID"] = user_list[0]
            else:
                # ������ �ƹ��� ������ ������ None
                room_data["RoomHostID"] = None
        
        # ���� ��� �ִ� ��� Firestore���� ���� ����
        if not user_list:
            room_data = room_doc.to_dict()
            chat_id = room_data.get("ChatID")
            doc_ref.delete() # �� ����
            if chat_id: # ä�� �÷��ǵ� ����
                chat_ref = firestore_client.collection("Chat").document(chat_id)
                chat_ref.delete()
            return {"message": f"Room '{room_id}' has been deleted as it is empty"}

        # ������Ʈ�� UserList ����
        room_data["UserList"] = user_list

        # Firestore�� ������Ʈ�� �� ���� ����
        doc_ref.update(room_data)

        return {"message": f"User '{user_id}' has left the room", "updated_room": room_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/firebase/Room/{room_id}/join", tags=["Room"], summary="Join a Room")
async def join_room(room_id: str, user_id: str):
    """
    Add a user to the UserList of an existing room.
    """
    try:
        # Firestore���� �ش� Room ��������
        doc_ref = firestore_client.collection("Room").document(room_id)
        room_doc = doc_ref.get()

        # �� ���� ���� Ȯ��
        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # �� ������ ��������
        room_data = room_doc.to_dict()
        user_list = room_data.get("UserList", [])
        max_user = room_data.get("MaxUser", 8)  # �⺻ �ִ� ���� ���� 8�� ����

        # �̹� �濡 �ִ� ���
        if user_id in user_list:
            raise HTTPException(status_code=400, detail=f"User '{user_id}' is already in the room")

        # ���� �� �� ���
        if len(user_list) >= max_user:
            raise HTTPException(status_code=400, detail=f"Room '{room_id}' is full")

        # ������ UserList�� �߰�
        user_list.append(user_id)
        room_data["UserList"] = user_list

        # Firestore�� ������Ʈ�� �� ���� ����
        doc_ref.update({"UserList": user_list})

        return {"message": f"User '{user_id}' has joined the room", "updated_room": room_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
Room API END
"""
class ChatMessage(BaseModel):
    Message: str
    UserID: str
    Time: datetime

class AddChatRequest(BaseModel):
    RoomID: str
    ChatMessage: ChatMessage

MAX_MESSAGES = 10  # �ִ� �޽��� �� ����
"""
Chat API START
"""
@app.put("/firebase/Chat/{chat_id}/add", tags=["Firebase"], summary="Add a Chat Message with FIFO")
async def add_chat_message(chat_id: str, chat_request: AddChatRequest):
    """
    Add a chat message to the Chat collection, maintaining a maximum of 10 messages (FIFO).
    """
    try:
        # Firestore���� ChatID ���� ��������
        doc_ref = firestore_client.collection("Chat").document(chat_id)
        chat_doc = doc_ref.get()

        if not chat_doc.exists:
            # ä�� ������ ������ ���� ����
            chat_data = {
                "ChatID": chat_id,
                "RoomID": chat_request.RoomID,
                "Messages": [chat_request.ChatMessage.dict()],
            }
            doc_ref.set(chat_data)
        else:
            # ���� �������� �޽��� ��������
            chat_data = chat_doc.to_dict()
            messages = chat_data.get("Messages", [])

            # FIFO ������� �޽��� �߰�
            if len(messages) >= MAX_MESSAGES:
                messages.pop(0)  # ���� ������ �޽��� ���� (ù ��° �޽���)
            messages.append(chat_request.ChatMessage.dict())  # ���ο� �޽��� �߰�

            # Firestore�� ������Ʈ
            chat_data["Messages"] = messages
            doc_ref.update({"Messages": messages})

        return {"message": "Chat message added successfully", "chat_id": chat_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""
Chat API END
"""
# Realtime Database�� ������ �߰�
@app.post("/firebase/realtime/items/", tags=["Firebase"])
async def add_item_to_realtime(item: Item):
    """
    Add an item to Realtime Database.
    """
    ref = realtime_db.child("items").push(item.dict())
    return {"message": "Item added successfully", "id": ref.key}

# Realtime Database���� ������ ��ȸ
@app.get("/firebase/realtime/items/{item_id}", tags=["Firebase"])
async def get_item_from_realtime(item_id: str):
    """
    Retrieve an item from Realtime Database by ID.
    """
    ref = realtime_db.child(f"items/{item_id}")
    data = ref.get()
    if data:
        return data
    else:
        raise HTTPException(status_code=404, detail="Item not found")
