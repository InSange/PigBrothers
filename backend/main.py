import asyncio  # 비동기 작업을 지원하기 위한 asyncio 모듈을 가져옵니다.
import random  # 난수를 생성하기 위한 random 모듈을 가져옵니다.
import sys  # 시스템 관련 기능을 사용하기 위한 sys 모듈을 가져옵니다.
import json  # JSON 데이터를 처리하기 위한 json 모듈을 가져옵니다.
from collections import defaultdict  # 기본값이 설정된 딕셔너리를 생성하기 위한 defaultdict를 가져옵니다.
from datetime import datetime  # 날짜와 시간을 처리하기 위한 datetime 모듈을 가져옵니다.
from typing import Union  # 여러 데이터 타입을 허용하기 위한 Union 타입 힌트를 가져옵니다.

# FastAPI와 관련된 라이브러리 및 예외 처리 클래스
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
# CORS 미들웨어를 설정하기 위한 FastAPI의 CORSMiddleware 모듈
from fastapi.middleware.cors import CORSMiddleware

# Firebase와 관련된 클라이언트 설정을 가져옵니다.
from firebase_config import firestore_client, realtime_db
# 사용자 정의 데이터 모델을 가져옵니다.
from models import *

# FastAPI 앱 인스턴스를 생성합니다.
app = FastAPI(
    title="My API with Response Models",  # API의 제목을 설정합니다.
    description="This API demonstrates how to define response types using response_model.",  # API 설명을 작성합니다.
    version="1.0.0"  # API 버전을 설정합니다.
)

# CORS 설정을 추가하여 외부 도메인에서 API에 접근할 수 있도록 허용합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인에서의 접근을 허용합니다.
    allow_credentials=True,  # 자격 증명을 포함한 요청을 허용합니다.
    allow_methods=["*"],  # 모든 HTTP 메서드(GET, POST 등)를 허용합니다.
    allow_headers=["*"],  # 모든 헤더를 허용합니다.
)

# 유저 소켓 관리
# 방에서 유저 소켓들을 관리하는 객체
class ConnectionManager:
    def __init__(self, room_id: str):
        self.room_id = room_id # 방 아이디
        self.active_connections: Dict[str, WebSocket] = {} # userID : WebSocket (유저 아이디의 웹 소켓을 딕셔너리형태로 저장)
        self.in_game = False  # 해당 방이 게임 중인지 확인하는 변수
        self.room_host: str = "" # 방장 

    def get_user_ids(self): # 방에 존재하는 플레이어 아이디(딕셔너리에서 키값)들을 반환
        # Return a list of all connected user IDs
        return list(self.active_connections.keys())

    async def connect(self, websocket: WebSocket, user_id: str): # 소켓 연결하는 함수
        self.active_connections[user_id] = websocket # 유저 아이디와 소켓을 맵핑
        if not self.room_host: # 방장이 없으면 방장을 해당 유저로 세팅
            self.room_host = user_id  # set ROOM HOST

    def disconnect(self, websocket: WebSocket, user_id: str): # 소켓 연결 해제하는 함수
        if user_id in self.active_connections: # 플레이어들 중에서 매개변수로 입력된 유저 아이디를 찾아 딕셔너리에서 제거
            del self.active_connections[user_id]
        if self.room_host == user_id and self.active_connections: # 제거한 유저가 방장이면
            self.room_host = next(iter(self.active_connections))  # 남은 사용자 중 첫 번째를 방장으로 설정
        elif not self.active_connections: # 남은 유저가 없다면 해당 인스턴스를 제거한다.
            room_manager.delete_room(self.room_id)

    async def broadcast(self, message: BaseMessage): # 메세지를 방에 있는 플레이어들 모두에게 전파
        # Message 객체를 JSON으로 변환
        message_json = message.json()

        # 모든 연결된 클라이언트에 메시지 전송
        for connection in self.active_connections.values():
            await connection.send_text(message_json)

    async def broadcast_to_user(self, user_id: str, message: BaseMessage): # 선택한 유저 아이디에게만 메시지를 전파
        message_json = message.json()

        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message_json)

# 각 방에 맞는 ConnectionManager 관리
# 싱글톤으로 처리. 서버가 한대라 상관없지만 localhost에서 실행하면 서버와 같이 실행되어 공유가 안되는 문제가 발생해서 처리
class RoomManager:
    _instance = None

    @staticmethod
    def get_instance(): # 싱글톤 객체 반환
        if RoomManager._instance is None:
            RoomManager()
        return RoomManager._instance

    def __init__(self):
        if RoomManager._instance is not None:
            raise Exception("This class is a singleton!")  
        self.rooms: Dict[str, ConnectionManager] = {} # 방 아이디와 해당 방에 연결되는 소켓들을 관리하는 인스턴스들을 딕셔너리로 관리
        RoomManager._instance = self

    def get_room(self, room_id: str) -> ConnectionManager: # 방에 대한 정보를 제공해주는 함수
        if room_id not in self.rooms:
            self.rooms[room_id] = ConnectionManager(room_id) # 방 아이디를 바탕으로 해당 방에 대한 연결된 플레이어 정보들을 가지고 있는 커넥션 매니저 인스턴스를 반환
        return self.rooms[room_id]
    
    def delete_room(self, room_id: str): # 방 아이디에 해당하는 방을 ㅔㅈ거
        if room_id in self.rooms:
            del self.rooms[room_id]

room_manager = RoomManager() # 싱글톤으로 처리한 룸 매니저 인스턴스 생성

# FastAPI를 사용하여 웹소켓 경로를 정의한 부분으로 웹소켓은 양방향 통신을 가능하게 하는 프로토콜임.
# 클라이언트와 서버가 실시간으로 데이터를 주고 받을 수 있게 해줌
@app.websocket("/ws/room/{room_id}/{user_id}") # 경로 설정 및 매개 변수들
async def websocket_room(websocket: WebSocket, room_id: str, user_id: str): # 웹소켓 요청을 처리하는 함수
    room_ref = firestore_client.collection("Room").document(room_id) # 파이어베이스에서 room_id에 해당하는 방에 대한 정보를 가져옴
    user_doc = firestore_client.collection("User").document(user_id).get() # 파이어베이스에서 user_id에 해당하는 유저 정보를 가져옴

    if not user_doc.exists: # 유저 정보가 없다면 예외 처리
        raise HTTPException(status_code=404, detail="User info not found")
    # 유저 데이터를 딕셔너리 형식으로 변환
    user_data = user_doc.to_dict()

    # create UserModel Instance
    user_info = UserModel(
        Name=user_data["Name"], # 유저 이름
        UserID=user_data["UserID"] # 유저 아이디
    )

    # 연결 수락
    # FastAPI에서 웹 소켓 연결을 수락하기 위한 메서드로 클라이언트에서 연결을 요청하면 이 호출을 통해 연결 요청을 명시적으로 승인함.
    await websocket.accept()

    try:
        # 방이 존재하는지 확인하고 방 생성 또는 참가 결정
        room_data = room_ref.get().to_dict()
        if not room_data:
            # 방이 존재하지 않으면 생성
            room_data = {
                "MaxUser": 8,
                "Name": f"Room_{room_id}",
                "RoomID": room_id,
                "RoomState": False,
                "RoomHostID": user_id,
                "UserList": [user_info.dict()],
            }
            room_ref.set(room_data)
            is_creator = True
            print("create ROOM {}".format(room_id))

        else:
            # 방이 존재하면 참가
            if any(user["UserID"] == user_id for user in room_data["UserList"]):
                # 특정 user_id가 존재하는지 확인하고 제거
                room_data["UserList"] = [user for user in room_data["UserList"] if user["UserID"] != user_id]
                print("Already User Del")
            elif len(room_data["UserList"]) >= room_data["MaxUser"]:
                # 방이 꽉찬상태라면 입장 불가하고 웹 소켓을 끊음.
                print("full {}".format(user_id))
                await websocket.close(code=4001, reason="Room is full.")
                return
            
            # 방 데이터에 해당 유저를 추가하고 파이어베이스 데이터를 업데이트
            room_data["UserList"].append(user_info.dict())
            room_ref.update({"UserList": room_data["UserList"]})
            is_creator = False
            print("add User in Room {}".format(user_info))

        # RoomManager에서 방 객체 가져오기 및 연결
        room = room_manager.get_room(room_id) # 해당 방 아이디에 대한 방 인스턴스가 없으면 만들어서 줌
        await room.connect(websocket, user_id)

        print("send room data {room_data}")
        print("Create Room Object {}".format(room_id))
        print(f"Active connections after connect: {len(room.active_connections)}")
        # 업데이트된 방에 대한 정보들을 현재 방에 있는 클라이언트들(유저)에게 전달해서 프론트 업데이트
        # 업데이트 (유저가 방에 입장, 유저가 방을 나감 등)과 같은 정보들을 전달.
        await room.broadcast(RoomInfo(
                                    type = "roomInfo",
                                    room = room_data
                                ))
        # 만약 재접속을 했을 때 해당 방이 이미 게임을 시작한 상태라면
    
        # 방 정보 전송
        if is_creator: # 방에 누가 입장했는지 알림창을 전달함.
            await room.broadcast( Alert(
                                        type="alert",
                                        text=f"{user_info.Name} created and joined the room '{room_id}'.",  # 전송할 텍스트 내용
                                    ))
        else:
            await room.broadcast( Alert(
                                        type="alert",
                                        text=f"{user_info.Name} joined the room '{room_id}'.",  # 전송할 텍스트 내용
                                    ))

        # 메시지 처리 루프
        await handle_room_while(websocket, room,room_id, user_id)

    except WebSocketDisconnect:
        # 연결 해제 시 처리
        room = room_manager.get_room(room_id)
        room.disconnect(websocket, user_id)

        # UserList에서 user_id에 해당하는 UserModel 객체를 찾고 삭제
        room_data["UserList"] = [
            user for user in room_data["UserList"] if user["UserID"] != user_id
        ]

        if not room_data["UserList"]:
            # 방에 사용자가 없으면 방 삭제
            room_manager.delete_room(room_id)
            room_ref.delete()
        else: # 연결이 끊기는 소켓이 방장이라면 방장을 변경해서 파이어베이스 업데이트
            if room_data["RoomHostID"] == user_id:
                room_data["RoomHostID"] = room_data["UserList"][0]["UserID"]
            room_ref.update({
                "UserList": [user for user in room_data["UserList"]],
                "RoomHostID": room_data["RoomHostID"]
            })
            user_name = next(
                (user["Name"] for user in room_data["UserList"] if user["UserID"] == user_id),
                None  # 기본값: 매칭된 데이터가 없을 경우 None 반환
            )
            await room.broadcast(
                Alert(
                    type="alert",
                    text=f"change the RoomHost {user_name}",  # 전송할 텍스트 내용
                )
            )
# 클라이언트와 서버가 계속 지속적으로 소통할 수 있는 비동기 함수
async def handle_room_while(websocket: WebSocket, room: ConnectionManager,room_id: str, user_id: str):
    """
    Player message logic process in game

    this.user = WebSocket
    room = room_manager.get_room(room_id)
    room_ref = firestore_client.collection("Room").document(room_id)
    """
    try:
        print(f"Active connections room while: {len(room.active_connections)}")
        while True: # 해당 반복문이 도는 동안에는 클라이언트로부터 메시지를 받아와 서버와 소통할 수 있음
            data = await websocket.receive_text() # 클라이언트로부터 메시지를 받음
            message = Chat.model_validate_json(data) # json 문자열을 디코딩해 Chat 타입으로 변경

            if message.type == "chat": # 메시지 타입이 채팅일 경우
                await room.broadcast(message) # 방에 존재하는 모든 플레이어에게 채팅을 전송

            elif message.type == "leave": # 메시지 타입이 방을 나가는 신호일 경우
                room_ref = firestore_client.collection("Room").document(room_id) # 방에 대한 정보를 가져와서
                if not room_ref.get().exists: # 방이 존재하지 않을 경우 예외 처리
                    print("no room")
                    await websocket.close(code=4000, reason="Room does not exist.")
                    return

                room_data = room_ref.get().to_dict() # 딕셔너리 형태로 변경 후
                if not any(user["UserID"] == user_id for user in room_data["UserList"]): # 방에 있는 유저 목록들 중에서 플레이어가 존재하지 않을 경우 예외처리
                    await websocket.close(code=4001, reason="User is not in the room.")
                    return

                # 해당 방에 있는 user_id에 해당하는 웹소켓 연결을 끊어버리고 (딕셔너리 삭제)
                room.disconnect(websocket, user_id)
                # 해당 user_id를 제외한 플레이어들 리스트를 업데이트 
                room_data["UserList"] = [
                    user for user in room_data["UserList"] if user["UserID"] != user_id
                ]

                if not room_data["UserList"]: # 방에 남은 유저들이 존재하지 않는다면
                    print("no player in leave API")
                    # 해당 방을 삭제하고
                    room_manager.delete_room(room.room_id)
                    room_ref.delete() # 파이어 베이스 업데이트후 소켓 연결 끊기
                    await websocket.close(code=1000, reason="Room is now empty and has been deleted.")
                    return

                # 방장이 해당 유저라면
                if room_data["RoomHostID"] == user_id:
                    print("room host set if leave")
                    room_data["RoomHostID"] = room_data["UserList"][0]["UserID"] # 다음 유저를 방장으로 설정

                # 방에 대한 정보 업데이트
                room_ref.update({
                    "UserList": [user for user in room_data["UserList"]],
                    "RoomHostID": room_data["RoomHostID"]
                })

                user_name = next(
                    (user["Name"] for user in room_data["UserList"] if user["UserID"] == user_id),
                    None  # 기본값: 매칭된 데이터가 없을 경우 None 반환
                )
                # 떠난 유저를 플레이어들에게 알리고
                await room.broadcast(Alert(
                    type = "alert",
                    text=f"leave user who {user_name}"
                ))
                # 변경된 방에 대한 정보들을 방에 있는 유저들에게 전달
                await room.broadcast(RoomInfo(
                    type = "roomInfo",
                    room = room_data
                ))

                await websocket.close(code=1000, reason="You have left the room.")
                return

    except WebSocketDisconnect: # 이전 소켓 디스커넥트와 동일
        room_ref = firestore_client.collection("Room").document(room_id)
        room.disconnect(websocket, user_id)
        if not room.active_connections:
            room_ref.delete()
        else:
            # firebase update if user out
            room_data = room_ref.get().to_dict()
            room_data["UserList"] = [
                user for user in room_data["UserList"] if user["UserID"] != user_id
            ]

            room_ref.update({"UserList": [user for user in room_data["UserList"]]})

            # if user that out of game is host sett next host
            if room.room_host == user_id and room.active_connections:
                room.room_host = next(iter(room.active_connections))  # 남은 사용자 중 첫 번째를 방장으로 설정
                room_ref.update({"RoomHostID": room.room_host})

"""
User API START
"""
# FastAPI 경로 정의 및 엔드포인트 설정. 그리고 docs에서 좀 더 직관적으로 분류하기 위한 매개 변수들
@app.post("/firebase/User/", tags=["User"], summary="Create an User", response_model=UserModel, name='Add User')
async def add_user(data: UserModel): # 유저 모델에 대한 데이터를 받았을 때
    """
    Add an User to Firestore.
    """
    # UserID duplication Check
    # 유저 아이디에 해당하는 유저 쿼리를 받아와서
    user_query = firestore_client.collection("User").where("UserID", "==", data.UserID).stream()
    for _ in user_query: # 만약 해당 유저아이디에 대한 정보가 하나라도 있으면 중복이라서 안됌
        raise HTTPException(status_code=400, detail="UserID already exists in the User collection")
    
    # Add data in FireStore
    # 파이어베이스 유저 컬렉션에 해당 유저 아이디 문서이름으로 데이터를 저장한다.
    doc_ref = firestore_client.collection("User").document(data.UserID)
    if(not data.Name): # 유저 이름 받기 필수
        raise HTTPException(status_code=404, detail="data not include UserName")
    if(not data.UserID): # 유저 아이디 받기 필수
        raise HTTPException(status_code=404, detail="UserID not found")
    doc_ref.set(data.dict()) # 유저 데이터로 문서 추가
    return {"message": "Item added successfully", "id": doc_ref.id, **data.dict()}

@app.get("/firebase/User/{user_id}", tags=["User"], summary="Get User by UserID", response_model=UserModel, name='Add User')
async def get_user(user_id: str): # 유저 정보를 불러오는 함수 API
    """
    Retrieve an User from Firestore by ID.
    """
    try: # 유저 쿼리를 찾아서
        user_query = firestore_client.collection("User").where("UserID", "==", user_id).stream()

        user_data = None
        for doc in user_query:
            user_data = doc.to_dict() 
            break 

        if not user_data:
            raise HTTPException(status_code=404, detail=f"User with UserID '{user_id}' not found")
        # 유저 데이터 전달
        return user_data 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/firebase/User/{item_id}", tags=["User"])
async def update_user(item_id: str, update_data: dict): # 유저 정보 업데이트하는 API. 현재 사용하지 않음.
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
"""
Room API START
"""
@app.get("/firebase/Room/{room_id}", tags=["Room"], summary="Get Current Rooms", response_model=RoomModel)
async def get_room_status(room_id: str): # 룸 ID에 대한 방을 찾는 API 함수
    try: # 데이터베이스에서 Room 컬렉션에서 room_id에 해당하는 문서를 가져옴
        room_ref = firestore_client.collection("Room").document(room_id)
        room_doc = room_ref.get()
        # 방에 대한 정보가 데이터베이스에 없으면 예외 처리
        if not room_doc.exists:
            raise HTTPException(status_code=404, detail="Room not found.")
        # 있으면 전달
        return room_doc.to_dict()
    
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/firebase/Room/", tags=["Room"], summary="Get ALL Rooms", response_model=List[RoomModel])
async def get_all_rooms(): # 모든 방에 대한 정보들을 반환
    """
    Retrieve all game rooms from Firestore.
    """
    try: # Room 컬렉션에 존재하는 모든 방 문서들을 전달.
        rooms_query = firestore_client.collection("Room").stream()

        rooms = [doc.to_dict() for doc in rooms_query]

        if not rooms:
            raise HTTPException(status_code=404, detail="No rooms found")

        return rooms 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
