# -*- coding: euc-kr -*-

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from firebase_config import firestore_client
from firebase_config import realtime_db
from pydantic import BaseModel, ValidationError
from typing import List, Dict
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict

import asyncio
import json

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
        self.is_alive = True # 생존 여부
        self.vote_count = 0 # 투표 받은 횟수

class Message(BaseModel):
    sender: str # 송신자
    text: str # 메시지 내용
    type: str # 메시지 타입

# 방 상태와 연결 관리
class ConnectionManager:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.active_connections: List[WebSocket] = [] # 웹 소켓 연결 목록
        self.players: List[str] = [] # 연결된 유저 ID 목록
        self.in_game = False  # 현재 상태 (False: 대기실, True: 게임 중)
        self.current_speaker_index = 0 # 현재 발언 플레이어 인덱스

    async def connect(self, websocket: WebSocket, user_id: str):
        """웹소켓 연결 추가"""
        await websocket.accept()
        self.active_connections.append(websocket)
        self.players.append(user_id)

    def disconnect(self, websocket: WebSocket, user_id: str):
        """웹소켓 연결 제거"""
        self.active_connections.remove(websocket)
        self.players.remove(user_id)

    async def broadcast(self, message):
        """모든 연결에 메시지 전송"""
        # 메시지가 객체라면 JSON 문자열로 변환
        if isinstance(message, BaseModel):
            message = message.json()
        elif not isinstance(message, str):
            message = json.dumps(message)

        for connection in self.active_connections:
            await connection.send_text(message)

    async def broadcast_message(self, message):
        """Message 객체를 모든 연결에 JSON 문자열로 브로드캐스트"""
        await self.broadcast(message)

    async def reset_votes(self):
        for player in self.players:
            player.vote_count = 0

# RoomManager: 방 관리
class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, ConnectionManager] = {} # 방 ID 별 ConnectionManager 관리

    def get_room(self, room_id: str) -> ConnectionManager:
        """방 가져오기, 없으면 새로 생성"""
        if room_id not in self.rooms:
            self.rooms[room_id] = ConnectionManager(room_id)
        return self.rooms[room_id]
    
    def delete_room(self, room_id: str):
        """방 삭제"""
        if room_id in self.rooms:
            del self.rooms[room_id]

# 룸 매니저 전역 객체
room_manager = RoomManager()

# WebSocket: 방 생성 및 연결 처리
@app.websocket("/ws/create/{room_id}/{user_id}/{room_name}")
async def websocket_create_room(websocket: WebSocket, room_id: str, user_id: str, room_name: str = None):
    """
    방 생성 및 웹소켓 연결 처리.
    """
    try:
        # Firestore에서 방 중복 확인
        room_ref = firestore_client.collection("Room").document(room_id)

        if room_ref.get().exists:
            await websocket.close(code=4000, reason="Room ID already exists.")
            return

        # 방 생성 및 Firestore에 저장
        room_data = {
            "MaxUser": 8,
            "Name": room_name,
            "RoomID": room_id,
            "RoomState": False,
            "RoomHostID": user_id,
            "UserList": [user_id],
        }
        room_ref.set(room_data)

        # 웹소켓 연결 처리
        room = room_manager.get_room(room_id)
        await room.connect(websocket, user_id)

        # 방 정보를 클라이언트로 전송
        await websocket.send_text(json.dumps({
            "type": "room_info",
            "data": room_data
        }))

        # 메시지 브로드캐스트
        await room.broadcast(f"{user_id} created and joined the room '{room_id}'.")

        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_text()
            try:
                # 메시지 모델로 파싱
                message = Message.model_validate_json(data)

                if message.type == "chat":
                    # 대기 상태에서만 채팅 허용
                    if not room.in_game:
                        await room.broadcast_message(message)
                    else:
                        await websocket.send_text("게임 중에는 채팅이 제한됩니다.")

                elif message.type == "start_game":
                    # 게임 시작
                    if not room.in_game:
                        room.in_game = True
                        await room.broadcast("관리자: 게임이 시작되었습니다!")
                        firestore_client.collection("Room").document(room_id).update({"RoomState": True})

                elif message.type == "end_game":
                    # 게임 종료
                    room.in_game = False
                    await room.broadcast("관리자: 게임이 종료되었습니다!")
                    firestore_client.collection("Room").document(room_id).update({"RoomState": False})

            except ValidationError as e:
                await websocket.send_text(f"Invalid message format: {e}")

    except WebSocketDisconnect:
        # 연결 끊김 처리
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

# Firestore에 데이터 추가
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

# Firestore에서 데이터 조회
@app.get("/firebase/User/{user_id}", tags=["User"], summary="Get User by UserID", response_model=UserModel, name='Add User')
async def get_user(user_id: str):
    """
    Retrieve an User from Firestore by ID.
    """
    try:
        # UserID를 기반으로 Firestore에서 사용자 조회
        user_query = firestore_client.collection("User").where("UserID", "==", user_id).stream()

        # 결과 처리
        user_data = None
        for doc in user_query:
            user_data = doc.to_dict()  # 첫 번째 결과를 가져옵니다.
            break  # UserID는 고유하다고 가정하므로 하나의 결과만 가져옵니다.

        # 사용자 존재 여부 확인
        if not user_data:
            raise HTTPException(status_code=404, detail=f"User with UserID '{user_id}' not found")

        return user_data  # 조회된 사용자 데이터 반환
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
    MaxUser: int = 8   # 최대 유저 수
    Name: str       # 방 이름
    RoomID: str     # 방 ID
    RoomState: bool = False # 방 상태 (True: 게임 시작, False: 게임 대기)
    RoomHostID: str # 방장 (맨 처음 생성한 유저 ID)
    UserList: List[str] = []# 유저 리스트 (UserID 배열)
    SessionID: str = None # 방 생성 시 ChatID를 저장
"""
Room API START
"""
# 방 상태 조회 API
@app.get("/firebase/Room/{room_id}", tags=["Room"], summary="Get Current Rooms", response_model=List[RoomModel])
async def get_room_status(room_id: str):
    """
    방 상태 조회.
    """
    room_ref = firestore_client.collection("Room").document(room_id)
    room_doc = room_ref.get()
    if not room_doc.exists:
        raise HTTPException(status_code=404, detail="Room not found.")
    return room_doc.to_dict()

# Firestore에서 모든 방에 대한 정보를 가져오기
@app.get("/firebase/Room/", tags=["Room"], summary="Get ALL Rooms", response_model=List[RoomModel])
async def get_all_rooms():
    """
    Retrieve all game rooms from Firestore.
    """
    try:
        # Firestore에서 모든 방 데이터 가져오기
        rooms_query = firestore_client.collection("Room").stream()

        # 결과 저장
        rooms = [doc.to_dict() for doc in rooms_query]

        # 방이 없을 경우
        if not rooms:
            raise HTTPException(status_code=404, detail="No rooms found")

        return rooms  # 방 데이터 리스트 반환
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/firebase/Room/{room_id}/start", tags=["Room"], summary="Start Game and Reset Chat")
async def start_game(room_id: str):
    """
    Start the game by setting RoomState to True and clearing chat messages.
    """
    try:
        # Firestore에서 Room 문서 가져오기
        room_ref = firestore_client.collection("Room").document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # RoomState를 True로 설정
        room_data = room_doc.to_dict()
        room_data["RoomState"] = True
        room_ref.update({"RoomState": True})

        # Firestore에서 Session 문서 가져오기
        session_ref = firestore_client.collection("Chat").document(room_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail=f"session with ID '{room_id}' not found")

        # 채팅 초기화 (Messages 배열 비우기)
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
        # Firestore에서 Room 문서 가져오기
        room_ref = firestore_client.collection("Room").document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # RoomState를 False로 설정
        room_data = room_doc.to_dict()
        room_data["RoomState"] = False
        room_ref.update({"RoomState": False})

        # Firestore에서 Session 문서 가져오기
        session_ref = firestore_client.collection("Chat").document(room_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail=f"session with ID '{room_id}' not found")

        # 채팅 초기화 (Messages 배열 비우기)
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
        # Firestore에서 해당 Room 가져오기
        doc_ref = firestore_client.collection("Room").document(room_id)
        room_doc = doc_ref.get()

        # 방 존재 여부 확인
        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # 방 데이터 가져오기
        room_data = room_doc.to_dict()
        user_list = room_data.get("UserList", [])

        # 유저가 UserList에 있는지 확인
        if user_id not in user_list:
            raise HTTPException(status_code=400, detail=f"User '{user_id}' is not in the room")

        # 유저를 UserList에서 제거
        user_list.remove(user_id)

        # 방장이 방을 나간 경우 처리
        if room_data.get("RoomHostID") == user_id:
            if user_list:
                # 남아있는 유저 중 첫 번째 유저를 방장으로 설정
                room_data["RoomHostID"] = user_list[0]
            else:
                # 유저가 아무도 없으면 방장은 None
                room_data["RoomHostID"] = None
        
        # 방이 비어 있는 경우 Firestore에서 문서 삭제
        if not user_list:
            room_data = room_doc.to_dict()
            room_id = room_data.get("RoomID")
            doc_ref.delete() # 방 삭제
            if room_id: # 채팅 컬렉션도 삭제
                session_ref = firestore_client.collection("Session").document(room_id)
                session_ref.delete()
            return {"message": f"Room '{room_id}' has been deleted as it is empty"}

        # 업데이트된 UserList 저장
        room_data["UserList"] = user_list

        # Firestore에 업데이트된 방 정보 저장
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
        # Firestore에서 해당 Room 가져오기
        doc_ref = firestore_client.collection("Room").document(room_id)
        room_doc = doc_ref.get()

        # 방 존재 여부 확인
        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # 방 데이터 가져오기
        room_data = room_doc.to_dict()
        user_list = room_data.get("UserList", [])
        max_user = room_data.get("MaxUser", 8)  # 기본 최대 유저 수는 8로 설정

        # 이미 방에 있는 경우
        if user_id in user_list:
            return {"message": f"User '{user_id}' has joined the room", "updated_room": room_data}

        # 방이 꽉 찬 경우
        if len(user_list) >= max_user:
            raise HTTPException(status_code=400, detail=f"Room '{room_id}' is full")

        # 유저를 UserList에 추가
        user_list.append(user_id)
        room_data["UserList"] = user_list

        # Firestore에 업데이트된 방 정보 저장
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

MAX_MESSAGES = 10  # 최대 메시지 수 제한
"""
Session API START
"""
@app.put("/firebase/Session/{room_id}/add", tags=["Session"], summary="Add a Chat Message with FIFO")
async def add_chat_message(room_id: str, session_request: AddSessionRequest):
    """
    Add a chat message to the Chat collection, maintaining a maximum of 10 messages (FIFO).
    """
    try:
        # Firestore에서 ChatID 문서 가져오기
        doc_ref = firestore_client.collection("Session").document(room_id)
        session_doc = doc_ref.get()

        if not session_doc.exists:
            # 채팅 문서가 없으면 새로 생성
            session_data = {
                "Messages": [session_request.ChatMessage.dict()],
            }
            doc_ref.set(session_data)
        else:
            # 기존 문서에서 메시지 가져오기
            session_data = session_doc.to_dict()
            messages = session_data.get("Messages", [])

            # FIFO 방식으로 메시지 추가
            if len(messages) >= MAX_MESSAGES:
                messages.pop(0)  # 가장 오래된 메시지 제거 (첫 번째 메시지)
            messages.append(session_request.ChatMessage.dict())  # 새로운 메시지 추가

            # Firestore에 업데이트
            session_data["Messages"] = messages
            doc_ref.update({"Messages": messages})

        return {"message": "Session message added successfully", "session_id": room_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""
Chat API END
"""
# Realtime Database에 데이터 추가
@app.post("/firebase/realtime/items/", tags=["Firebase"])
async def add_item_to_realtime(item: Item):
    """
    Add an item to Realtime Database.
    """
    ref = realtime_db.child("items").push(item.dict())
    return {"message": "Item added successfully", "id": ref.key}

# Realtime Database에서 데이터 조회
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
