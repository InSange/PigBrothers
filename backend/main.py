import asyncio
import random
import json
from collections import defaultdict
from datetime import datetime
from typing import Union

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import firestore_client, realtime_db
from models import *

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

# Game Manager
# Game process class
class Game:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.running = False
        self.players = [] # players in game
        self.wolf = "" # player ID on Wolf
        self.wolf_choice = None
        self.check_timer = 10
        self.chat_timer = 30
        self.vote_timer = 30
        self.wolf_timer = 10
        self.dead_players = []
        self.votes= {}
        self.winner = None
        self.process = ""
        self.wolfSubject = ""
        self.pigSubject = ""

        self.room = room_manager.get_room(room_id)
        self.current_player = ""

    async def start_game(self):
        self.running = True

        self.players = self.room.get_user_ids()
        print(f"Initialized players: {self.players}")

        # start Game
        await self.room.broadcast(Process(
            type = "process",
            state = "dayTime",
            time = 3
        ))
        self.process = "dayTime"
        
        await self.room.broadcast(GameInfo(
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))
        # select player for wolf role
        await self.choose_wolf()

        await self.room.broadcast(GameInfo(
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))

        # wait 
        await asyncio.sleep(3)

        # set thema
        await self.assign_roles()
        await self.room.broadcast(GameInfo(
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))

        await self.room.broadcast(Process(
            type = "process",
            state = "dayTime",
            time = self.check_timer
        ))
        # wait for check thema
        await asyncio.sleep(self.check_timer)

        # start Game!
        while self.running and len(self.players) > 1:
            await self.start_chat_round()

            await self.start_vote_round()

            if self.check_game_end():
                break

            await self.start_wolf_round()

            if self.check_game_end():
                break

        await self.end_game()

    async def choose_wolf(self):
        # set wolf
        self.wolf = random.choice(self.players)

        # notify to player who roles wolf
        await self.room.broadcast_to_user(self.wolf, Alert(
            type = "alert",
            text = f"{self.wolf} you are wolf!",  # Àü¼ÛÇÒ ÅØ½ºÆ® ³»¿ë
        ))

    async def assign_roles(self):
        # notify to Players who pigs
        self.wolfSubject = "animal"
        self.pigSubject = "pig"

        for player in self.players:
            if player == self.wolf:
                await self.room.broadcast_to_user(player, Role(
                    # alert topic
                    type = "role",
                    userID = player,
                    role = "wolf",
                    word = self.wolfSubject
                ))
            else: # that pigs
                await self.room.broadcast_to_user(player, Role(
                    # alert topic
                    type = "role",
                    userID = player,
                    role = "pig",
                    word = self.pigSubject
                ))

    async def start_chat_round(self):
        # random
        current_turn = random.randint(0, len(self.players) - 1) # set index for first
        turn_count = 0 # check turn

        await self.room.broadcast(Process(
            type = "process",
            state = "dayTime",
            time = 30
        ))
        self.process = "dayTime"

        # all player chatt start
        while self.running and len(self.players) > 1:
            self.current_player = self.players[current_turn]
            # broad cast who turns
            await self.room.broadcast(Alert(
                type = "alert",
                text = f"{self.current_player} are turn!"
            ))

            await self.room.broadcast_to_user(self.current_player, State(
                type = "state",
                userID = self.current_player,
                speak = True
            ))

            await self.room.broadcast(GameInfo(
                type="gameInfo",
                wolf=self.wolf,
                live_player=self.players,
                dead_player=self.dead_players,
                process=self.process,
                current_player=self.current_player,
                wolfSubject=self.wolfSubject,
                pigSubject=self.pigSubject
            ))

            await asyncio.sleep(10)

            # wait
            await self.room.broadcast(Alert(
                type = "alert",
                text = f"{self.current_player} are turn over"
            ))

            await self.room.broadcast_to_user(self.current_player, State(
                type = "state",
                userID = self.current_player,
                speak = False
            ))

            turn_count += 1

            # next player
            current_turn = (current_turn + 1) % len(self.players)

            # check vote
            if turn_count == len(self.players):
                return

    async def start_vote_round(self):
        # start vote
        await self.room.broadcast(Process(
            type = "process",
            state = "vote",
            time = 30
        ))
        
        self.process = "vote"

        await self.room.broadcast(GameInfo(
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))

        self.votes = {player: 0 for player in self.players}

        # wait for vote
        await asyncio.sleep(self.vote_timer)

        # result after vote
        most_voted_player = self.calculate_votes()

        # check kill to many vote player
        if most_voted_player:
            await self.room.broadcast(Alert(
                type = "alert",
                text = f"{most_voted_player} is most voted player!"
            ))
            await self.kill_player(most_voted_player)
        else:
            await self.room.broadcast(Alert(
                type = "alert",
                text = "all alive"
            ))

        await self.room.broadcast(GameInfo(
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))

    async def start_wolf_round(self):
        await self.room.broadcast(Process(
            type = "process",
            state = "night",
            time = 30
        ))
        self.process = "night"

        await self.room.broadcast(GameInfo(
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))

        self.wolf_choice = None
        if self.wolf in self.players:
            await self.room.broadcast_to_user(self.wolf, Alert(
                type="alert",
                text = "select player who kill at this turn"
            ))

            await asyncio.sleep(self.wolf_timer)

            # select player who eliminate pig
            chosen_victim = self.wolf_choice if self.wolf_choice else self.wolf_choose_victim()
            if chosen_victim:
                await self.kill_player(chosen_victim)
                await self.room.broadcast(Alert(
                    type="alert",
                    text = f"{chosen_victim} is dead!"
                ))

        await self.room.broadcast(GameInfo(
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))

    def wolf_choose_victim(self):
        available_targets = [player for player in self.players if player != self.wolf]
        return random.choice(available_targets) if available_targets else None

    def receive_wolf_choice(self,chosen_victim : str):
        if chosen_victim in self.players and chosen_victim != self.wolf:
            self.wolf_choice = chosen_victim

    def receive_vote(self, voter_id: str, voted_player: str):
        if voted_player in self.votes:
            self.votes[voted_player] += 1
    
    async def kill_player(self, player):
        self.players.remove(player)
        self.dead_players.append(player)

    def calculate_votes(self):
        if not self.votes:
            return None
        
        max_votes = max(self.votes.values())

        most_voted_players = [player for player, count in self.votes.items() if count == max_votes]

        if len(most_voted_players) > 1:
            return None
 
        return most_voted_players[0]
    
    async def check_game_end(self):
        num_alive = len(self.players)
        if self.wolf not in self.players:
            self.winner = "pigs"
            return True
        elif num_alive == 2 and self.wolf in self.players:
            self.winner = "wolf"
            return True
        return False

    async def end_game(self):
        self.running = False

        await self.room.broadcast(Process(
            type = "process",
            state = "end",
            time = 0
        ))
        self.process = "end"

        await self.room.broadcast(GameInfo(
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))

        if self.winner == "pigs":
            # who's the win?
            await self.room.broadcast(Alert(
                type = "alert",
                text = "pig win"
            ))
        else :
            await self.room.broadcast(Alert(
                type = "alert",
                text = "wolf win"
            ))

        # µ¥ÀÌÅÍº£ÀÌ½º¿¡¼­ RoomState¸¦ False·Î ¾÷µ¥ÀÌÆ®
        self.room.in_game = False
        room_ref = firestore_client.collection("Room").document(self.room_id)
        room_ref.update({"RoomState": False})

        game_manager.end_game(self.room_id)

class GameManager:
    def __init__(self) -> None:
        self.games: Dict[str, Game] = {} # room id : Game class
    
    def start_game(self, room_id: str):
        if room_id in self.games:
            return self.games[room_id]
        
        game = Game(room_id)
        self.games[room_id] = game
        asyncio.create_task(game.start_game())
        return game
    
    def end_game(self, room_id: str):
        if room_id in self.games:
            self.games[room_id].end_game()
            del self.games[room_id]

    def get_game(self, room_id: str) -> Game:
        if room_id not in self.games:
            raise ValueError(f"No game found with room_id: {room_id}")
        return self.games[room_id]

game_manager = GameManager()

# À¯Àú ¼ÒÄÏ °ü¸®

class ConnectionManager:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.active_connections: Dict[str, WebSocket] = {} # userID : WebSocket
        self.in_game = False  
        self.room_host: str = ""

    def get_user_ids(self):
        # Return a list of all connected user IDs
        return list(self.active_connections.keys())

    async def connect(self, websocket: WebSocket, user_id: str):
        self.active_connections[user_id] = websocket
        if not self.room_host:
            self.room_host = user_id  # set ROOM HOST

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if self.room_host == user_id and self.active_connections:
            self.room_host = next(iter(self.active_connections))  # ³²Àº »ç¿ëÀÚ Áß Ã¹ ¹øÂ°¸¦ ¹æÀåÀ¸·Î ¼³Á¤
        elif not self.active_connections:
            room_manager.delete_room(self.room_id)

    async def broadcast(self, message: BaseMessage):
        # Message °´Ã¼¸¦ JSONÀ¸·Î º¯È¯
        message_json = message.json()

        # ¸ðµç ¿¬°áµÈ Å¬¶óÀÌ¾ðÆ®¿¡ ¸Þ½ÃÁö Àü¼Û
        for connection in self.active_connections.values():
            await connection.send_text(message_json)

    async def broadcast_to_user(self, user_id: str, message: BaseMessage):
        message_json = message.json()

        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message_json)

# °¢ ¹æ¿¡ ¸Â´Â ConnectionManager °ü¸®

class RoomManager:
    _instance = None

    @staticmethod
    def get_instance():
        if RoomManager._instance is None:
            RoomManager()
        return RoomManager._instance

    def __init__(self):
        if RoomManager._instance is not None:
            raise Exception("This class is a singleton!")  
        self.rooms: Dict[str, ConnectionManager] = {}
        RoomManager._instance = self

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
    user_doc = firestore_client.collection("User").document(user_id).get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User info not found")

    user_data = user_doc.to_dict()

    # create UserModel Instance
    user_info = UserModel(
        Name=user_data["Name"],
        UserID=user_data["UserID"]
    )

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
                "UserList": [user_info.dict()],
            }
            room_ref.set(room_data)
            is_creator = True
            print("create ROOM {}".format(room_id))

        else:
            # ¹æÀÌ Á¸ÀçÇÏ¸é Âü°¡
            if any(user["UserID"] == user_id for user in room_data["UserList"]):
                # Æ¯Á¤ user_id°¡ Á¸ÀçÇÏ´ÂÁö È®ÀÎÇÏ°í Á¦°Å
                room_data["UserList"] = [user for user in room_data["UserList"] if user["UserID"] != user_id]
                print("Already User Del")
            elif len(room_data["UserList"]) >= room_data["MaxUser"]:
                print("full {}".format(user_id))
                await websocket.close(code=4001, reason="Room is full.")
                return
            

            room_data["UserList"].append(user_info.dict())
            room_ref.update({"UserList": room_data["UserList"]})
            is_creator = False
            print("add User in Room {}".format(user_info))

        # RoomManager¿¡¼­ ¹æ °´Ã¼ °¡Á®¿À±â ¹× ¿¬°á
        room = room_manager.get_room(room_id)
        await room.connect(websocket, user_id)

        print("send room data {room_data}")
        print("Create Room Object {}".format(room_id))
        print(f"Active connections after connect: {len(room.active_connections)}")

        if room.in_game:
            game_info = game_manager.get_game(room_id)
            await room.broadcast(GameInfo(
                type="gameInfo",
                wolf=game_info.wolf,
                live_player=game_info.players,
                dead_player=game_info.dead_players,
                process=game_info.process,
                current_player=game_info.current_player,
                wolfSubject=game_info.wolfSubject,
                pigSubject=game_info.pigSubject
            ))
        else:
            # ¹æ Á¤º¸ Àü¼Û
            if is_creator:
                await room.broadcast( Alert(
                                            type="alert",
                                            text=f"{user_info.Name} created and joined the room '{room_id}'.",  # Àü¼ÛÇÒ ÅØ½ºÆ® ³»¿ë
                                        ))
                await room.broadcast(RoomInfo(
                                            type = "roomInfo",
                                            room = room_data
                                        ))
            else:
                await room.broadcast( Alert(
                                            type="alert",
                                            text=f"{user_info.Name} joined the room '{room_id}'.",  # Àü¼ÛÇÒ ÅØ½ºÆ® ³»¿ë
                                        ))
                await room.broadcast(RoomInfo(
                                            type = "roomInfo",
                                            room = room_data
                                        ))

        # ¸Þ½ÃÁö Ã³¸® ·çÇÁ
        await handle_room_while(websocket, room,room_id, user_id)

    except WebSocketDisconnect:
        # ¿¬°á ÇØÁ¦ ½Ã Ã³¸®
        room = room_manager.get_room(room_id)
        room.disconnect(websocket, user_id)

        # UserList¿¡¼­ user_id¿¡ ÇØ´çÇÏ´Â UserModel °´Ã¼¸¦ Ã£°í »èÁ¦
        room_data["UserList"] = [
            user for user in room_data["UserList"] if user["UserID"] != user_id
        ]

        if not room_data["UserList"]:
            # ¹æ¿¡ »ç¿ëÀÚ°¡ ¾øÀ¸¸é ¹æ »èÁ¦
            room_manager.delete_room(room_id)
            room_ref.delete()
        else:
            if room_data["RoomHostID"] == user_id:
                room_data["RoomHostID"] = room_data["UserList"][0]["UserID"]
            room_ref.update({
                "UserList": [user for user in room_data["UserList"]],
                "RoomHostID": room_data["RoomHostID"]
            })

            await room.broadcast(
                Alert(
                    type="alert",
                    text=f"change the RoomHost {room_data["RoomHostID"]}",  # Àü¼ÛÇÒ ÅØ½ºÆ® ³»¿ë
                )
            )

async def handle_room_while(websocket: WebSocket, room: ConnectionManager,room_id: str, user_id: str):
    """
    Player message logic process in game

    this.user = WebSocket
    room = room_manager.get_room(room_id)
    room_ref = firestore_client.collection("Room").document(room_id)
    """
    try:
        print(f"Active connections room while: {len(room.active_connections)}")
        while True:
            data = await websocket.receive_text()
            message = Chat.model_validate_json(data)

            if message.type == "chat":
                await room.broadcast(message)

            elif message.type == "leave":
                room_ref = firestore_client.collection("Room").document(room_id)
                if not room_ref.get().exists:
                    print("no room")
                    await websocket.close(code=4000, reason="Room does not exist.")
                    return

                room_data = room_ref.get().to_dict()
                if not any(user["UserID"] == user_id for user in room_data["UserList"]):
                    await websocket.close(code=4001, reason="User is not in the room.")
                    return

                # WebSocket ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ Ã³ï¿½ï¿½
                room.disconnect(websocket, user_id)

                room_data["UserList"] = [
                    user for user in room_data["UserList"] if user["UserID"] != user_id
                ]

                if not room_data["UserList"]:
                    print("no player in leave API")
                    # ï¿½æ¿¡ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½
                    room_manager.delete_room(room.room_id)
                    room_ref.delete()
                    await websocket.close(code=1000, reason="Room is now empty and has been deleted.")
                    return

                # ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½Î¿ï¿½ ï¿½ï¿½ï¿½ï¿½ ï¿½ï¿½ï¿½ï¿½
                if room_data["RoomHostID"] == user_id:
                    print("room host set if leave")
                    room_data["RoomHostID"] = room_data["UserList"][0]["UserID"] 

                # Firebase ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½Æ®
                room_ref.update({
                    "UserList": [user for user in room_data["UserList"]],
                    "RoomHostID": room_data["RoomHostID"]
                })

                await room.broadcast(Alert(
                    type = "alert",
                    text=f"leave user who {user_id}"
                ))

                await room.broadcast(RoomInfo(
                    type = "roomInfo",
                    room = room_data
                ))

                await websocket.close(code=1000, reason="You have left the room.")
                return

            elif message.type == "vote":
                curGame = game_manager.get_game(room.room_id)

                curGame.receive_vote(message.userID, user_id)
                print("vote player")
            elif message.type == "kill":
                curGame = game_manager.get_game(room.room_id)

                curGame.receive_wolf_choice(message.userID)
                print("kill palyer")

    except WebSocketDisconnect:
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
                room.room_host = next(iter(room.active_connections))  # ³²Àº »ç¿ëÀÚ Áß Ã¹ ¹øÂ°¸¦ ¹æÀåÀ¸·Î ¼³Á¤
                room_ref.update({"RoomHostID": room.room_host})

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
    doc_ref = firestore_client.collection("User").document(data.UserID)
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
"""
Room API START
"""
@app.get("/firebase/Room/{room_id}", tags=["Room"], summary="Get Current Rooms", response_model=RoomModel)
async def get_room_status(room_id: str):
    try:
        room_ref = firestore_client.collection("Room").document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            raise HTTPException(status_code=404, detail="Room not found.")
        
        return room_doc.to_dict()
    
    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

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
        print(f"Current rooms in RoomManager: {room_manager.rooms.keys()}")
        print(f"Current rooms in RoomManager: {room_id}")

        room = room_manager.get_room(room_id)
        if not room:
            raise HTTPException(status_code = 404, detail="Room not found")
        print("Start ROOM Room Player {}".format(len(room.active_connections)))
        if len(room.active_connections) < 2:
            raise HTTPException(status_code = 400, detail="Not enough players to start the game")

        # Create Game Instance
        game_manager.start_game(room_id)

        # update game state
        room.in_game = True
        room_ref = firestore_client.collection("Room").document(room_id)
        room_ref.update({"RoomState": True})

        return {"message": f"Game started for Room '{room_id}'"}

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

        return {"message": f"Game ended for Room '{room_id}'"}

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
        
        if not any(user["UserID"] == user_id for user in user_list):
            raise HTTPException(status_code=400, detail=f"User '{user_id}' is not in the room")

        user_list = [user for user in user_list if user["UserID"] != user_id]

        if room_data.get("RoomHostID") == user_id:
            if user_list:
                room_data["RoomHostID"] = user_list[0]["UserID"]
            else:
                room_data["RoomHostID"] = None
        
        if not user_list:
            room_data = room_doc.to_dict()
            room_id = room_data.get("RoomID")
            doc_ref.delete() 

            return {"message": f"Room '{room_id}' has been deleted as it is empty"}

        room_data["UserList"] = [user.dict() for user in user_list]

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

        if any(user["UserID"] == user_id for user in user_list):
            return {"message": f"User '{user_id}' has joined the room", "updated_room": room_data}

        if len(user_list) >= max_user:
            raise HTTPException(status_code=400, detail=f"Room '{room_id}' is full")
        
        user_doc = firestore_client.collection("User").document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail=f"User with ID '{user_id}' not found")

        user_data = user_doc.to_dict()

        user_list.append(user_data)
        room_data["UserList"] = user_list

        doc_ref.update(room_data)

        return {"message": f"User '{user_id}' has joined the room", "updated_room": room_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
Room API END
"""
