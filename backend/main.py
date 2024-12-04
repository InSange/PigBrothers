import asyncio
import json
from collections import defaultdict
from datetime import datetime
from typing import Dict, List

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import firestore_client, realtime_db
from pydantic import BaseModel, ValidationError

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
        self.user_id = "active" # "active", "disconnected", "eliminated"
        self.is_alive = True 
        self.vote_count = 0 

class Message(BaseModel):
    sender: str
    text: str 
    type: str 

class ConnectionManager:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.active_connections: List[WebSocket] = [] 
        self.players: List[str] = [] 
        self.in_game = False  
        self.room_host: str = ""

    async def connect(self, websocket: WebSocket, user_id: str):
        self.active_connections.append(websocket)
        self.players.append(user_id)
        if not self.room_host:
            self.room_host = user_id  # set ROOM HOST

    def disconnect(self, websocket: WebSocket, user_id: str):
        self.active_connections.remove(websocket)
        self.players.remove(user_id)
        if self.room_host == user_id and self.players:
            self.room_host = self.players[0]  # Set remain User First
        elif not self.players:
            room_manager.delete_room(self.room_id)

    async def broadcast(self, message):
        if isinstance(message, BaseModel):
            message = message.json()
        elif not isinstance(message, str):
            message = json.dumps(message)

        for connection in self.active_connections:
            await connection.send_text(message)

    async def broadcast_message(self, message):
        await self.broadcast(message)

    async def reset_votes(self):
        for player in self.players:
            player.vote_count = 0

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, ConnectionManager] = {} 

    def get_room(self, room_id: str) -> ConnectionManager:
        if room_id not in self.rooms:
            self.rooms[room_id] = ConnectionManager(room_id)
        return self.rooms[room_id]
    
    def delete_room(self, room_id: str):
        if room_id in self.rooms:
            del self.rooms[room_id]

room_manager = RoomManager()

@app.websocket("/ws/room/{room_id}/{user_id}")
async def websocket_room(websocket: WebSocket, room_id: str, user_id: str):
    room_ref = firestore_client.collection("Room").document(room_id)

    # ¿¬°á ¼ö¶ô
    await websocket.accept()

    try:
        # ¹æÀÌ Á¸ÀçÇÏ´ÂÁö È®ÀÎÇÏ°í ¹æ »ý¼º ¶Ç´Â Âü°¡ °áÁ¤
        room_data = room_ref.get().to_dict()
        if not room_data:
            # ¹æÀÌ Á¸ÀçÇÏÁö ¾ÊÀ¸¸é »ý¼º
            room_data = {
                "MaxUser": 8,
                "Name": f"Room_{room_id}",
                "RoomID": room_id,
                "RoomState": False,
                "RoomHostID": user_id,
                "UserList": [user_id],
            }
            room_ref.set(room_data)
            is_creator = True
        else:
            # ¹æÀÌ Á¸ÀçÇÏ¸é Âü°¡
            if len(room_data["UserList"]) >= room_data["MaxUser"]:
                await websocket.close(code=4001, reason="Room is full.")
                return
            if user_id in room_data["UserList"]:
                await websocket.close(code=4002, reason="User already in the room.")
                return

            room_data["UserList"].append(user_id)
            room_ref.update({"UserList": room_data["UserList"]})
            is_creator = False

        # RoomManager¿¡¼­ ¹æ °´Ã¼ °¡Á®¿À±â ¹× ¿¬°á
        room = room_manager.get_room(room_id)
        await room.connect(websocket, user_id)

        # ¹æ Á¤º¸ Àü¼Û
        await websocket.send_text(json.dumps({
            "sender": "host",
            "type": "room_info",
            "data": room_data
        }))

        if is_creator:
            await room.broadcast(f"{user_id} created and joined the room '{room_id}'.")
        else:
            await room.broadcast(f"{user_id} joined the room '{room_id}'.")

        # ¸Þ½ÃÁö Ã³¸® ·çÇÁ
        await handle_room_while(websocket, room, room_ref, user_id)

    except WebSocketDisconnect:
        # ¿¬°á ÇØÁ¦ ½Ã Ã³¸®
        room.disconnect(websocket, user_id)
        room_data["UserList"].remove(user_id)

        if not room_data["UserList"]:
            # ¹æ¿¡ »ç¿ëÀÚ°¡ ¾øÀ¸¸é ¹æ »èÁ¦
            room_manager.delete_room(room_id)
            room_ref.delete()
        else:
            if room_data["RoomHostID"] == user_id:
                room_data["RoomHostID"] = room_data["UserList"][0]
            room_ref.update({
                "UserList": room_data["UserList"],
                "RoomHostID": room_data["RoomHostID"]
            })

            await room.broadcast({
                "type": "update_room",
                "data": {
                    "room_host": room_data["RoomHostID"],
                    "players": room_data["UserList"]
                }
            })

async def handle_room_while(websocket: WebSocket, room: ConnectionManager, room_ref, user_id: str):
    """
    Player message logic process in game

    this.user = WebSocket
    room = room_manager.get_room(room_id)
    room_ref = firestore_client.collection("Room").document(room_id)
    """
    try:
        while True:
            data = await websocket.receive_text()
            message = Message.model_validate_json(data)

            if message.type == "chat":
                if not room.in_game:
                    await room.broadcast_message(message)
                else:
                    await websocket.send_text(json.dumps({
                            "sender": "host",
                            "type": "room_info",
                            "text": "room_data"
                        }))
                    
            elif message.type == "leave":
                if not room_ref.get().exists:
                    await websocket.close(code=4000, reason="Room does not exist.")
                    return

                room_data = room_ref.get().to_dict()

                if user_id not in room_data["UserList"]:
                    await websocket.close(code=4001, reason="User is not in the room.")
                    return

                # WebSocket ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ Ã³ï¿½ï¿½
                room.disconnect(websocket, user_id)

                # Firebaseï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½
                room_data["UserList"].remove(user_id)

                if not room_data["UserList"]:
                    # ï¿½æ¿¡ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½
                    room_manager.delete_room(room.room_id)
                    room_ref.delete()
                    await websocket.close(code=1000, reason="Room is now empty and has been deleted.")
                    return

                # ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½Î¿ï¿½ ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½
                if room_data["RoomHostID"] == user_id:
                    room_data["RoomHostID"] = room_data["UserList"][0]  # Ã¹ ï¿½ï¿½Â° ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½

                # Firebase ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½Æ®
                room_ref.update({
                    "UserList": room_data["UserList"],
                    "RoomHostID": room_data["RoomHostID"]
                })

                # ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ï¿½é¿¡ï¿½ï¿½ ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½Æ®
                await room.broadcast({
                    "type": "update_room",
                    "data": {
                        "room_host": room_data["RoomHostID"],
                        "players": room_data["UserList"]
                    }
                })

                await websocket.close(code=1000, reason="You have left the room.")

            elif message.type == "start_game":
                if not room.in_game:
                    room.in_game = True
                    await room.broadcast("Game has started!")
                    room_ref.update({"RoomState": True})

            elif message.type == "end_game":
                room.in_game = False
                await room.broadcast("Game has ended!")
                room_ref.update({"RoomState": False})

    except WebSocketDisconnect:
        room.disconnect(websocket, user_id)
        if not room.active_connections:
            room_ref.delete()
        else:
            # firebase update if user out
            room_data = room_ref.get().to_dict()
            room_data["UserList"].remove(user_id)
            room_ref.update({"UserList": room_data["UserList"]})

            # if user that out of game is host sett next host
            if room.room_host == user_id and room.players:
                room.room_host = room.players[0]
                room_ref.update({"RoomHostID": room.room_host})

            await room.broadcast({
                "type": "update_room",
                "data": {
                    "room_host": room.room_host,
                    "players": room.players
                }
            })


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

@app.get("/firebase/User/{user_id}", tags=["User"], summary="Get User by UserID", response_model=UserModel, name='Add User')
async def get_user(user_id: str):
    """
    Retrieve an User from Firestore by ID.
    """
    try:
        user_query = firestore_client.collection("User").where("UserID", "==", user_id).stream()

        user_data = None
        for doc in user_query:
            user_data = doc.to_dict() 
            break 

        if not user_data:
            raise HTTPException(status_code=404, detail=f"User with UserID '{user_id}' not found")

        return user_data 
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
    MaxUser: int = 8  
    Name: str 
    RoomID: str    
    RoomState: bool = False 
    RoomHostID: str 
    UserList: List[str] = []
    SessionID: str = None 
"""
Room API START
"""
@app.get("/firebase/Room/{room_id}", tags=["Room"], summary="Get Current Rooms", response_model=List[RoomModel])
async def get_room_status(room_id: str):
    room_ref = firestore_client.collection("Room").document(room_id)
    room_doc = room_ref.get()
    if not room_doc.exists:
        raise HTTPException(status_code=404, detail="Room not found.")
    return room_doc.to_dict()

@app.get("/firebase/Room/", tags=["Room"], summary="Get ALL Rooms", response_model=List[RoomModel])
async def get_all_rooms():
    """
    Retrieve all game rooms from Firestore.
    """
    try:
        rooms_query = firestore_client.collection("Room").stream()

        rooms = [doc.to_dict() for doc in rooms_query]

        if not rooms:
            raise HTTPException(status_code=404, detail="No rooms found")

        return rooms 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/firebase/Room/{room_id}/start", tags=["Room"], summary="Start Game and Reset Chat")
async def start_game(room_id: str):
    """
    Start the game by setting RoomState to True and clearing chat messages.
    """
    try:
        room = room_manager.get_room(room_id)
        if not room:
            raise HTTPException(status_code = 404, detail="Room not found")
        
        if len(room.players) < 2:
            raise HTTPException(status_code = 400, detail="Not enough players to start the game")

        # update game state
        room.in_game = True
        room_ref = firestore_client.collection("Room").document(room_id)
        room_ref.update({"RoomState": True})

        # WebSocketÀ¸·Î ºê·ÎµåÄ³½ºÆ®
        await room.broadcast({
            "sender": "host",
            "type": "game_start",
            "message": "The game has started!"
        })

        return {"message": f"Game started for Room '{room_id}', session has been reset"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/firebase/Room/{room_id}/end", tags=["Room"], summary="End Game and Reset Chat")
async def end_game(room_id: str):
    """
    End the game by setting RoomState to False and clearing chat messages.
    """
    try:
        room_ref = firestore_client.collection("Room").document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        room_data = room_doc.to_dict()
        room_data["RoomState"] = False
        room_ref.update({"RoomState": False})

        session_ref = firestore_client.collection("Chat").document(room_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail=f"session with ID '{room_id}' not found")

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
        doc_ref = firestore_client.collection("Room").document(room_id)
        room_doc = doc_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        room_data = room_doc.to_dict()
        user_list = room_data.get("UserList", [])

        if user_id not in user_list:
            raise HTTPException(status_code=400, detail=f"User '{user_id}' is not in the room")

        user_list.remove(user_id)

        if room_data.get("RoomHostID") == user_id:
            if user_list:
                room_data["RoomHostID"] = user_list[0]
            else:
                room_data["RoomHostID"] = None
        
        if not user_list:
            room_data = room_doc.to_dict()
            room_id = room_data.get("RoomID")
            doc_ref.delete() 
            if room_id: 
                session_ref = firestore_client.collection("Session").document(room_id)
                session_ref.delete()
            return {"message": f"Room '{room_id}' has been deleted as it is empty"}

        room_data["UserList"] = user_list

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
        doc_ref = firestore_client.collection("Room").document(room_id)
        room_doc = doc_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail=f"Room with ID '{room_id}' not found")

        room_data = room_doc.to_dict()
        user_list = room_data.get("UserList", [])
        max_user = room_data.get("MaxUser", 8) 

        if user_id in user_list:
            return {"message": f"User '{user_id}' has joined the room", "updated_room": room_data}

        if len(user_list) >= max_user:
            raise HTTPException(status_code=400, detail=f"Room '{room_id}' is full")

        user_list.append(user_id)
        room_data["UserList"] = user_list

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

MAX_MESSAGES = 10 
"""
Session API START
"""
@app.put("/firebase/Session/{room_id}/add", tags=["Session"], summary="Add a Chat Message with FIFO")
async def add_chat_message(room_id: str, session_request: AddSessionRequest):
    """
    Add a chat message to the Chat collection, maintaining a maximum of 10 messages (FIFO).
    """
    try:
        doc_ref = firestore_client.collection("Session").document(room_id)
        session_doc = doc_ref.get()

        if not session_doc.exists:
            session_data = {
                "Messages": [session_request.ChatMessage.dict()],
            }
            doc_ref.set(session_data)
        else:
            session_data = session_doc.to_dict()
            messages = session_data.get("Messages", [])

            if len(messages) >= MAX_MESSAGES:
                messages.pop(0)  
            messages.append(session_request.ChatMessage.dict()) 

            session_data["Messages"] = messages
            doc_ref.update({"Messages": messages})

        return {"message": "Session message added successfully", "session_id": room_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""
Chat API END
"""
@app.post("/firebase/realtime/items/", tags=["Firebase"])
async def add_item_to_realtime(item: Item):
    """
    Add an item to Realtime Database.
    """
    ref = realtime_db.child("items").push(item.dict())
    return {"message": "Item added successfully", "id": ref.key}

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
