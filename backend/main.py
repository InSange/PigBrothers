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

# Firestore에 데이터 추가
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

# Firestore에서 데이터 조회
@app.get("/firebase/User/{user_id}", tags=["User"], summary="Get User by UserID", response_model=UserModel)
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
    ChatID: str = None # 방 생성 시 ChatID를 저장
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
        # RoomID 중복 여부 확인
        room_query = firestore_client.collection("Room").document(data.RoomID).get()
        if room_query.exists:
            raise HTTPException(status_code=400, detail=f"Room with ID '{data.RoomID}' already exists")

        # Chat 문서 생성 (방에서 사용할 채팅 내역)
        chat_ref = firestore_client.collection("Chat").document()
        chat_id = chat_ref.id # 파이어스토에서 자동 생성한 ID값

        chat_data = {
            "ChatID": chat_id, # 채팅 자료 ID
            "RoomID": data.RoomID, # 방 ID
            "Messages": [], # 메시지 배열
        }
        chat_ref.set(chat_data)

        # 초기화 값 설정
        room_data = {
            "MaxUser": data.MaxUser,
            "Name": data.Name,
            "RoomID": data.RoomID,
            "RoomState": False,  # 항상 False로 초기화
            "RoomHostID": data.RoomHostID,
            "UserList": [data.RoomHostID],  # 방장이 UserList에 자동으로 추가
            "ChatID": chat_id,
        }

        # Firestore에 저장
        firestore_client.collection("Room").document(data.RoomID).set(room_data)

        return room_data  # 성공적으로 생성된 방 데이터 반환
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

        # ChatID 가져오기
        chat_id = room_data.get("ChatID")
        if not chat_id:
            raise HTTPException(status_code=404, detail=f"Chat not found for Room '{room_id}'")

        # Firestore에서 Chat 문서 가져오기
        chat_ref = firestore_client.collection("Chat").document(chat_id)
        chat_doc = chat_ref.get()

        if not chat_doc.exists:
            raise HTTPException(status_code=404, detail=f"Chat with ID '{chat_id}' not found")

        # 채팅 초기화 (Messages 배열 비우기)
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
        # Firestore에서 Room 문서 가져오기
        room_ref = firestore_client.collection("Room").document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        # RoomState를 False로 설정
        room_data = room_doc.to_dict()
        room_data["RoomState"] = False
        room_ref.update({"RoomState": False})

        # ChatID 가져오기
        chat_id = room_data.get("ChatID")
        if not chat_id:
            raise HTTPException(status_code=404, detail=f"Chat not found for Room '{room_id}'")

        # Firestore에서 Chat 문서 가져오기
        chat_ref = firestore_client.collection("Chat").document(chat_id)
        chat_doc = chat_ref.get()

        if not chat_doc.exists:
            raise HTTPException(status_code=404, detail=f"Chat with ID '{chat_id}' not found")

        # 채팅 초기화 (Messages 배열 비우기)
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
            chat_id = room_data.get("ChatID")
            doc_ref.delete() # 방 삭제
            if chat_id: # 채팅 컬렉션도 삭제
                chat_ref = firestore_client.collection("Chat").document(chat_id)
                chat_ref.delete()
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
            raise HTTPException(status_code=400, detail=f"User '{user_id}' is already in the room")

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
class ChatMessage(BaseModel):
    Message: str
    UserID: str
    Time: datetime

class AddChatRequest(BaseModel):
    RoomID: str
    ChatMessage: ChatMessage

MAX_MESSAGES = 10  # 최대 메시지 수 제한
"""
Chat API START
"""
@app.put("/firebase/Chat/{chat_id}/add", tags=["Firebase"], summary="Add a Chat Message with FIFO")
async def add_chat_message(chat_id: str, chat_request: AddChatRequest):
    """
    Add a chat message to the Chat collection, maintaining a maximum of 10 messages (FIFO).
    """
    try:
        # Firestore에서 ChatID 문서 가져오기
        doc_ref = firestore_client.collection("Chat").document(chat_id)
        chat_doc = doc_ref.get()

        if not chat_doc.exists:
            # 채팅 문서가 없으면 새로 생성
            chat_data = {
                "ChatID": chat_id,
                "RoomID": chat_request.RoomID,
                "Messages": [chat_request.ChatMessage.dict()],
            }
            doc_ref.set(chat_data)
        else:
            # 기존 문서에서 메시지 가져오기
            chat_data = chat_doc.to_dict()
            messages = chat_data.get("Messages", [])

            # FIFO 방식으로 메시지 추가
            if len(messages) >= MAX_MESSAGES:
                messages.pop(0)  # 가장 오래된 메시지 제거 (첫 번째 메시지)
            messages.append(chat_request.ChatMessage.dict())  # 새로운 메시지 추가

            # Firestore에 업데이트
            chat_data["Messages"] = messages
            doc_ref.update({"Messages": messages})

        return {"message": "Chat message added successfully", "chat_id": chat_id}

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
