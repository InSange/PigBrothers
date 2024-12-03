import asyncio
import json
from collections import defaultdict
from datetime import datetime
from typing import Dict, List

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import firestore_client, realtime_db
from pydantic import BaseModel

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

# WebSocket Check

class Player:
    def __init__(self, name: str):
        self.name = name
        self.is_alive = True # ���� ����
        self.vote_count = 0 # ��ǥ ���� Ƚ��

class Message(BaseModel):
    sender: str # �۽���
    text: str # �޽��� ����
    type: str # �޽��� Ÿ��

# �� ���¿� ���� ����
class ConnectionManager:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.active_connections: List[WebSocket] = [] # �� ���� ���� ���
        self.players: List[str] = [] # ����� ���� ID ���
        self.in_game = False  # ���� ���� (False: ����, True: ���� ��)
        self.current_speaker_index = 0 # ���� �߾� �÷��̾� �ε���

    async def connect(self, websocket: WebSocket, user_id: str):
        """������ ���� �߰�"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.players.append(user_id)

    def disconnect(self, websocket: WebSocket, user_id: str):
        """������ ���� ����"""
        self.active_connections.remove(websocket)
        self.players.remove(user_id)

    async def broadcast(self, message: Message):
        """��� ���ῡ �޽��� ����"""
        for connection in self.active_connections:
            await connection.send_text(message)

    async def reset_votes(self):
        for player in self.players:
            player.vote_count = 0

# RoomManager: �� ����
class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, ConnectionManager] = {} # �� ID �� ConnectionManager ����

    def get_room(self, room_id: str) -> ConnectionManager:
        """�� ��������, ������ ���� ����"""
        if room_id not in self.rooms:
            self.rooms[room_id] = ConnectionManager(room_id)
        return self.rooms[room_id]
    
    def delete_room(self, room_id: str):
        """�� ����"""
        if room_id in self.rooms:
            del self.rooms[room_id]

# �� �Ŵ��� ���� ��ü
room_manager = RoomManager()

# WebSocket: �� ���� �� ���� ó��
@app.websocket("/ws/create/{room_id}/{user_id}/{room_name}")
async def websocket_create_room(websocket: WebSocket, room_id: str, user_id: str, room_name: str = None):
    """
    �� ���� �� ������ ���� ó��.
    """
    try:
        # Firestore���� �� �ߺ� Ȯ��
        room_ref = firestore_client.collection("Room").document(room_id)

        if room_ref.get().exists:
            await websocket.close(code=4000, reason="Room ID already exists.")
            return

        # �� ���� �� Firestore�� ����
        room_data = {
            "MaxUser": 8,
            "Name": room_name,
            "RoomID": room_id,
            "RoomState": False,
            "RoomHostID": user_id,
            "UserList": [user_id],
        }
        room_ref.set(room_data)

        # ������ ���� ó��
        room = room_manager.get_room(room_id)
        await room.connect(websocket, user_id)

        # �� ������ Ŭ���̾�Ʈ�� ����
        await websocket.send_text(json.dumps({
            "type": "room_info",
            "data": room_data
        }))

        # �޽��� ��ε�ĳ��Ʈ
        await room.broadcast(f"{user_id} created and joined the room '{room_id}'.")

        while True:
            # Ŭ���̾�Ʈ�κ��� �޽��� ����
            data = await websocket.receive_text()
            message = Message.model_validate_json(data)

            if message.type == "chat":
                # ��� ���¿����� ä�� ���
                if not room.in_game:
                    await room.broadcast(message)
                else:
                    await websocket.send_text("���� �߿��� ä���� ���ѵ˴ϴ�.")

            elif message.type == "start_game":
                # ���� ����
                if not room.in_game:
                    room.in_game = True
                    await room.broadcast("������: ������ ���۵Ǿ����ϴ�!")
                    firestore_client.collection("Room").document(room_id).update({"RoomState": True})

            elif message.type == "end_game":
                # ���� ����
                room.in_game = False
                await room.broadcast("������: ������ ����Ǿ����ϴ�!")
                firestore_client.collection("Room").document(room_id).update({"RoomState": False})

    except WebSocketDisconnect:
        # ���� ���� ó��
        room.disconnect(websocket, user_id)
        if not room.active_connections:
            room_manager.delete_room(room_id)

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
@app.post("/firebase/User/", tags=["User"], summary="Create an User", response_model=UserModel, name='Add User')
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
@app.get("/firebase/User/{user_id}", tags=["User"], summary="Get User by UserID", response_model=UserModel, name='Add User')
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
    SessionID: str = None # �� ���� �� ChatID�� ����
"""
Room API START
"""
# �� ���� ��ȸ API
@app.get("/firebase/Room/{room_id}", tags=["Room"], summary="Get Current Rooms", response_model=List[RoomModel])
async def get_room_status(room_id: str):
    """
    �� ���� ��ȸ.
    """
    room_ref = firestore_client.collection("Room").document(room_id)
    room_doc = room_ref.get()
    if not room_doc.exists:
        raise HTTPException(status_code=404, detail="Room not found.")
    return room_doc.to_dict()

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

        # Firestore���� Session ���� ��������
        session_ref = firestore_client.collection("Chat").document(room_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail=f"session with ID '{room_id}' not found")

        # ä�� �ʱ�ȭ (Messages �迭 ����)
        session_ref.update({"Messages": []})

        return {"message": f"Game started for Room '{room_id}', session has been reset"}

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

        # Firestore���� Session ���� ��������
        session_ref = firestore_client.collection("Chat").document(room_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail=f"session with ID '{room_id}' not found")

        # ä�� �ʱ�ȭ (Messages �迭 ����)
        session_ref.update({"Messages": []})

        return {"message": f"Game ended for Room '{room_id}', session has been reset"}

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
            room_id = room_data.get("RoomID")
            doc_ref.delete() # �� ����
            if room_id: # ä�� �÷��ǵ� ����
                session_ref = firestore_client.collection("Session").document(room_id)
                session_ref.delete()
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
            return {"message": f"User '{user_id}' has joined the room", "updated_room": room_data}

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
class ChatInfo(BaseModel):
    ChatID: str
    Text: str
    UserID: str
    UserName: str
    Time: datetime

class AddSessionRequest(BaseModel):
    ChatMessage: ChatInfo

MAX_MESSAGES = 10  # �ִ� �޽��� �� ����
"""
Session API START
"""
@app.put("/firebase/Session/{room_id}/add", tags=["Session"], summary="Add a Chat Message with FIFO")
async def add_chat_message(room_id: str, session_request: AddSessionRequest):
    """
    Add a chat message to the Chat collection, maintaining a maximum of 10 messages (FIFO).
    """
    try:
        # Firestore���� ChatID ���� ��������
        doc_ref = firestore_client.collection("Session").document(room_id)
        session_doc = doc_ref.get()

        if not session_doc.exists:
            # ä�� ������ ������ ���� ����
            session_data = {
                "Messages": [session_request.ChatMessage.dict()],
            }
            doc_ref.set(session_data)
        else:
            # ���� �������� �޽��� ��������
            session_data = session_doc.to_dict()
            messages = session_data.get("Messages", [])

            # FIFO ������� �޽��� �߰�
            if len(messages) >= MAX_MESSAGES:
                messages.pop(0)  # ���� ������ �޽��� ���� (ù ��° �޽���)
            messages.append(session_request.ChatMessage.dict())  # ���ο� �޽��� �߰�

            # Firestore�� ������Ʈ
            session_data["Messages"] = messages
            doc_ref.update({"Messages": messages})

        return {"message": "Session message added successfully", "session_id": room_id}

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
