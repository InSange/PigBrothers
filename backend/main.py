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

# Python의 재귀 호출 제한을 설정합니다. 기본값은 1000이며, 여기서는 2000으로 확장합니다.
sys.setrecursionlimit(2000)

# WebSocket Check

# Game Manager
# Game process class
# 게임 프로세스를 관리하는 클래스
class Game:
    def __init__(self, room_id: str):
        self.room_id = room_id # 해당 게임이 실행되는 방의 아이디
        self.running = False # 불형 게임 루프 관리
        self.players = [] # players in game
        self.wolf = "" # player ID on Wolf
        self.wolf_choice = None # 늑대가 선택한 유저 ID
        self.check_timer = 10 # 시간들
        self.chat_timer = 10
        self.vote_timer = 10
        self.wolf_timer = 10
        self.dead_players = [] # 사망한 플레이어들
        self.votes= {} # 각 플레이어들 투표
        self.winner = None # 이긴 진영  
        self.process = "" # 현재 게임 프로세스
        self.wolfSubject = "" # 늑대 주제
        self.pigSubject = "" # 돼지 주제어

        self.room = room_manager.get_room(room_id) # 방 객체 정보 관리(해당 방에 있는 유저들)
        self.current_player = "" # 현재 발언권을 가진 유저 ID

    async def start_game(self): # 게임 시작 함수
        self.running = True # 반복 

        self.players = self.room.get_user_ids() # 방 정보에서부터 게임에 참가하는 유저들 정보 가져오기
        print(f"Initialized players: {self.players}")

        # start Game
        # 방에 있는 유저들에게 현재 프로세스 단계를 전파
        await self.room.broadcast(Process(
            type = "process",
            state = "dayTime",
            time = 3
        ))
        self.process = "dayTime" # 아침은 채팅 및 역할 세팅
        
        await self.room.broadcast(GameInfo( # 방에 대한 정보들을 플에이어게 전파
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
        await self.choose_wolf() # 플레이어들 중에서 늑대 지정

        await self.room.broadcast(GameInfo( # 클라이언트 업데이트
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
        await self.assign_roles() # 각자 역할 및 주제어 할당
        await self.room.broadcast(GameInfo( # 플레이어들에게 전파
            type="gameInfo",
            wolf=self.wolf,
            live_player=self.players,
            dead_player=self.dead_players,
            process=self.process,
            current_player=self.current_player,
            wolfSubject=self.wolfSubject,
            pigSubject=self.pigSubject
        ))
        # 주어진 주제를 확인할 시간을 할당.
        await self.room.broadcast(Process(
            type = "process",
            state = "dayTime",
            time = self.check_timer
        ))
        # wait for check thema
        await asyncio.sleep(self.check_timer)

        # start Game!
        # 게임이 끝나는 조건. 늑대가 죽거나, 남은 플레이어가 두 명일 때 늑대와 돼지 한마리씩 남았을 경우
        # 외에 예외 사항 처리
        while self.running and len(self.players) > 1:
            await self.start_chat_round() # 채팅 시작 

            await self.start_vote_round() # 투표 시작

            if await self.check_game_end(): # 투표 처치 후 남은 인원 체크
                break # 끝나는 조건을 충족 시 반복문 종료

            await self.start_wolf_round() # 늑대가 사냥할 돼지 플레이어 선택

            if await self.check_game_end(): # 동일
                break

        await self.end_game() # 게임 종료

    async def choose_wolf(self): # 늑대 선정 함수
        # set wolf
        self.wolf = random.choice(self.players) # 플레이어들 중에서 랜덤으로 늑대 설정

        # notify to player who roles wolf
        # 늑대로 지목된 플레이어한테 자신이 늑대라는 알림을 전송
        await self.room.broadcast_to_user(self.wolf, Alert(
            type = "alert",
            text = "you are wolf!",  # 전송할 텍스트 내용
        ))

    async def assign_roles(self): # 각자 역할에 맞는 주제 설정
        # notify to Players who pigs
        self.wolfSubject = "animal" # 랜덤 주제
        self.pigSubject = "pig" # 랜덤 주제

        for player in self.players:
            if player == self.wolf: # 플레이어중 늑대인 사람에게 키워드 전달
                await self.room.broadcast_to_user(player, Role(
                    # alert topic
                    type = "role",
                    userID = player,
                    role = "wolf",
                    word = self.wolfSubject
                ))
            else: # that pigs 플레이어중 돼지인 사람에게 돼지 키워드 전달
                await self.room.broadcast_to_user(player, Role(
                    # alert topic
                    type = "role",
                    userID = player,
                    role = "pig",
                    word = self.pigSubject
                ))

    async def start_chat_round(self): # 채팅 프로세스 시작 함수
        # random 랜덤으로 시작 순서 설정
        current_turn = random.randint(0, len(self.players) - 1) # set index for first
        turn_count = 0 # check turn

        await self.room.broadcast(Process(
            type = "process",
            state = "dayTime",
            time = 10
        ))
        self.process = "dayTime"

        # all player chatt start
        # 플레이어 수 만큼 발언권이 주어짐.
        while self.running and len(self.players) > 1:
            self.current_player = self.players[current_turn] # 현재 발언권을 가진 플레이어
            # 파이어베이스에서 유저 정보를 가져와서
            room_ref = firestore_client.collection("Room").document(self.room_id)
            room_data = room_ref.get().to_dict()
            # 현재 유저 닉네임을 가져옴
            user_name = next(
                (user["Name"] for user in room_data["UserList"] if user["UserID"] == self.current_player),
                None  # 기본값: 매칭된 데이터가 없을 경우 None 반환
            )

            # broad cast who turns
            # 현재 발언권을 가진 유저를 전체 클라이언트에게 뿌려줌
            await self.room.broadcast(Alert(
                type = "alert",
                text = f"{user_name} are turn!"
            ))
            # 현재 발언권을 가진 플레이어게 State객체를 전달
            # 해당 객체로 클라이언트에서 채팅을 칠 수 있게 제어함.
            await self.room.broadcast_to_user(self.current_player, State(
                type = "state",
                userID = self.current_player,
                speak = True
            ))
            # 해당 게임 상태들을 클라이언트에게 업데이트
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
            # 턴 끝
            await self.room.broadcast(Alert(
                type = "alert",
                text = f"{user_name} are turn over"
            ))
            # 발언권이 끝나면 현재 발언권을 가진 플레이어의 제어 상태를 다시 False로 채팅을 못치게 함
            await self.room.broadcast_to_user(self.current_player, State(
                type = "state",
                userID = self.current_player,
                speak = False
            ))
            # 턴 수 증가(현재까지 발언한 플레이어 수)
            turn_count += 1

            # next player
            # 그다음 플레이어 발언권 세팅
            current_turn = (current_turn + 1) % len(self.players)

            # check vote
            # 모든 플레이어가 발언을 했으면 함수 종료
            if turn_count == len(self.players):
                return

    async def start_vote_round(self): # 투표 시작하는 함수
        await self.room.broadcast(Alert(
            type = "alert",
            text = "Lets start Vote Time!!!!"
        ))
        # start vote
        await self.room.broadcast(Process(
            type = "process",
            state = "vote",
            time = self.vote_timer
        ))
        
        self.process = "vote"
        # 현재 게임 프로세스 상태를 플레이어들에게 전달
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
        # 모든 플레이어 투표수를 0으로 세팅
        self.votes = {player: 0 for player in self.players}

        # wait for vote
        await asyncio.sleep(self.vote_timer)

        # result after vote
        most_voted_player = self.calculate_votes() # 투표 결과를 통해 가장 많은 투표를 받은 플레이어

        room_ref = firestore_client.collection("Room").document(self.room_id)
        room_data = room_ref.get().to_dict()

        user_name = next(
            (user["Name"] for user in room_data["UserList"] if user["UserID"] == most_voted_player),
            None  # 기본값: 매칭된 데이터가 없을 경우 None 반환
        )

        # check kill to many vote player
        if most_voted_player: # 가장 많은 투표를 받은 플레이어가 있으면
            await self.room.broadcast(Alert(
                type = "alert",
                text = f"{user_name} is most voted player!"
            ))
            await self.kill_player(most_voted_player) # 가장 많은 투표를 받은 플레이어 사망
        else: # 투표수가 동률이라면 스킵
            await self.room.broadcast(Alert(
                type = "alert",
                text = "all alive"
            ))
        # 게임 정보 업데이트 전파
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

    async def start_wolf_round(self): # 늑대가 돼지를 잡아먹을 차례
        await self.room.broadcast(Process(
            type = "process",
            state = "night",
            time = self.wolf_timer
        ))
        self.process = "night"
        await self.room.broadcast(Alert(
                type="alert",
                text = "To Night...."
            ))
        # 변경된 프로세스(늑대가 돼지를 잡아먹을 차례)를 모든 플레이어들에게 전파
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
        if self.wolf in self.players: # 늑대가 플레이어들 중에 있다면
            await self.room.broadcast_to_user(self.wolf, Alert(
                type="alert",
                text = "select player who kill at this turn"
            ))

            await asyncio.sleep(self.wolf_timer)

            # select player who eliminate pig
            # 늑대가 선택한 유저가 있으면 해당 유저를, 없으면 랜덤으로 차출
            chosen_victim = self.wolf_choice if self.wolf_choice else self.wolf_choose_victim()

            room_ref = firestore_client.collection("Room").document(self.room_id)
            room_data = room_ref.get().to_dict()

            user_name = next(
                (user["Name"] for user in room_data["UserList"] if user["UserID"] == chosen_victim),
                None  # 기본값: 매칭된 데이터가 없을 경우 None 반환
            )
            # 선택한 유저를 죽인다!
            if chosen_victim:
                await self.kill_player(chosen_victim)
                await self.room.broadcast(Alert(
                    type="alert",
                    text = f"{user_name} is dead!"
                ))
        # 늑대가 처리한 돼지까지 게임 정보를 클라이언트에게 전송 및 업데이트
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
    # 늑대가 잡아먹을 돼지를 선택하지 않았을 경우 게임에 참여한 플레이어들 중에서 한명을 랜덤으로 선택하는 함수
    def wolf_choose_victim(self):
        available_targets = [player for player in self.players if player != self.wolf]
        return random.choice(available_targets) if available_targets else None
    # 클라이언트(늑대)로부터 받은 응답을 처리하는 함수
    def receive_wolf_choice(self,chosen_victim : str):
        # 선택한 유저 아이디가 현재 게임 내부에 있는 플레이어들 중 하나라면 해당 유저를 사냥하는 것으로 채택
        if chosen_victim in self.players and chosen_victim != self.wolf:
            self.wolf_choice = chosen_victim
    # 클라이언트(돼지)들로부터 투표한 사람들에 대한 유저 아이디를 받아 투표수들을 업데이트
    def receive_vote(self, voter_id: str, voted_player: str):
        if voted_player in self.votes:
            self.votes[voter_id] += 1
        print("cur Vote List {self.votes}")
    # 현재 살아있는 플레이어들 리슽트 중에서 죽이고자하는 플레이어를 제거하고 죽은 플레이어 리스트에 추가
    async def kill_player(self, player):
        self.players.remove(player)
        self.dead_players.append(player)
    # 투표 수를 계산하는 함수
    def calculate_votes(self):
        if not self.votes:
            return None
        # 투표한 값들 중에서 가장 큰 투표값을 차출
        max_votes = max(self.votes.values())
        # 가장 높은 투표값들을 지닌 플레이어들(1명 or 여러명)을 배열로 차출
        most_voted_players = [player for player, count in self.votes.items() if count == max_votes]
        # 가장 높은 투표값들을 지닌 플레이어들이 여러명이면 아무도 안죽음
        if len(most_voted_players) > 1:
            return None
        # 가장 높은 투표값을 지닌 플레이어를 반환
        return most_voted_players[0]
    # 게임 종료 조건 확인하는 함수
    async def check_game_end(self):
        num_alive = len(self.players) # 살아있는 플레이어 수
        if self.wolf not in self.players: # 살아있는 플레이어들 중에 늑대가 없다면 돼지들의 승리
            self.winner = "pigs"
            self.running = False
            return True
        elif num_alive == 2 and self.wolf in self.players: # 남은 플레이어 수가 두 명이고 늑대가 살아있다면 늑대 승리
            self.winner = "wolf"
            self.running = False 
            return True
        return False
    # 해당 게임이 끝나고 게임 인스턴스를 제거하는 함수
    async def end_game(self):
        self.running = False

        self.process = "end"
        '''
        # 게임이 끝난 것을 플레이어들에게 업데이트
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
        '''

        await self.room.broadcast(Process(
            type = "process",
            state = "end",
            time = 0
        ))
    
        # 이긴 진영쪽을 알려줌
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

        # 데이터베이스에서 RoomState를 False로 업데이트
        self.room.in_game = False
        room = room_manager.get_room(self.room_id)
        room_ref = firestore_client.collection("Room").document(self.room_id)
        room_ref.update({"RoomState": False})
        room_data = room_ref.get().to_dict()

        await room.broadcast(RoomInfo(
                                    type = "roomInfo",
                                    room = room_data
                                ))

        await game_manager.end_game(self.room_id)
# 모든 게임을 관리하는 게임 매니저 인스턴스
class GameManager:
    def __init__(self) -> None: # 초기화 ( 방 아이디와 해당 방 게임 인스턴스를 저장할 딕셔너리 설정 )
        self.games: Dict[str, Game] = {} # room id : Game class
    
    def start_game(self, room_id: str): # 게임 시작 함수
        if room_id in self.games: # 이미 해당 방의 게임 인스턴스가 존재한다면
            return self.games[room_id] # 해당 게임 인스턴스를 바로 반환
        # 게임 인스턴스가 없다면
        game = Game(room_id) # 만들어서
        self.games[room_id] = game # 해당 방 아이디로 설정
        # 비동기 함수를 실행하는 비동기 작업을 생성하는 것으로 이벤트 루프에서 병렬로 실행됨. 
        # Non blocking 형식으로 다른 코드 실행을 멈추지 않고 동시에 진행됨
        asyncio.create_task(game.start_game()) 
        return game # 게임 인스턴스 반환
    
    async def end_game(self, room_id: str): # 게임 종료 함수
        if room_id in self.games:
            del self.games[room_id] # 룸 아이디에 해당하는 방의 게임 인스턴스를 삭제

    def get_game(self, room_id: str) -> Game: # 현재 게임 인스턴스 반환
        if room_id not in self.games: # 게임 인스턴스가 존재하지 않음녀 예외 처리
            raise ValueError(f"No game found with room_id: {room_id}")
        return self.games[room_id]

game_manager = GameManager() # 게임 인스턴스 생성. 원래 싱글톤으로 처리하고자 할까 했지만 서버가 한대라 생략

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
@app.websocket("/ws/room/{room_id}/{user_id}/{room_name}") # 경로 설정 및 매개 변수들
async def websocket_room(websocket: WebSocket, room_id: str, user_id: str, room_name: str = None): # 웹소켓 요청을 처리하는 함수
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
            if not room_name:
                await websocket.close(code=4001, reason="room name is empty")
                return
            # 방이 존재하지 않으면 생성
            room_data = {
                "MaxUser": 8,
                "Name": room_name,
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
        if room.in_game:
            game_info = game_manager.get_game(room_id) # 게임에 대한 정보를 가져와서
            await room.broadcast(GameInfo( # 모든 플레이어들에게 게임 정보를 전달
                type="gameInfo",
                wolf=game_info.wolf,
                live_player=game_info.players,
                dead_player=game_info.dead_players,
                process=game_info.process,
                current_player=game_info.current_player,
                wolfSubject=game_info.wolfSubject,
                pigSubject=game_info.pigSubject
            ))
        else: # 그게 아니라면
            # 방 정보 전송
            if is_creator: # 방에 누가 입장했는지 알림창을 전달함.
                await room.broadcast( Alert(
                                            type="alert",
                                            text=f"{user_info.Name} created and joined the room '{room_data["Name"]}'.",  # 전송할 텍스트 내용
                                        ))
            else:
                await room.broadcast( Alert(
                                            type="alert",
                                            text=f"{user_info.Name} joined the room '{room_data["Name"]}'.",  # 전송할 텍스트 내용
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
                if room.in_game:
                    curGame = game_manager.get_game(room.room_id)
                    if curGame.current_player != user_id:
                        continue

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
            # 만약 메시지의 유형이 투표라면
            elif message.type == "vote":
                curGame = game_manager.get_game(room.room_id) # 방 아이디에 해당하는 게임 인스턴스를 불러와서

                curGame.receive_vote(message.userID, user_id) # 투표하는 함수를 불러와 메세지에 있는 userID의 값을 1 증가시킨다.
                print("vote player {user_id} => {message.userID}")
            elif message.type == "kill": # 메시지의 유형이 킬이라면
                curGame = game_manager.get_game(room.room_id) # 게임 정보를 불러와

                curGame.receive_wolf_choice(message.userID) # 늑대가 선택한 유저 아이디를 설정한다.
                print("kill palyer")

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
    
@app.put("/firebase/Room/{room_id}/start", tags=["Room"], summary="Start Game and Reset Chat")
async def start_game(room_id: str): # 게임 시작 API 함수
    """
    Start the game by setting RoomState to True and clearing chat messages.
    """
    try:
        print(f"Current rooms in RoomManager: {room_manager.rooms.keys()}")
        print(f"Current rooms in RoomManager: {room_id}")
        # 방 정보를 불러온다. (룸 아이디에 해당하는 커넥션 매니저 인스턴스를 불러와 정보 관리)
        room = room_manager.get_room(room_id)
        if not room: # 방이 존재하지 않을 시 예외 처리
            raise HTTPException(status_code = 404, detail="Room not found")
        print("Start ROOM Room Player {}".format(len(room.active_connections)))
        if len(room.active_connections) < 2: # 플레이어의 수가 2명 이하면 게임을 시작할 수 없는 예외 처리
            raise HTTPException(status_code = 400, detail="Not enough players to start the game")

        # Create Game Instance
        game_manager.start_game(room_id) # 룸 아이디에 해당하는 게임 인스턴스를 생성

        # update game state
        room.in_game = True # 방 게임 시작했다는 변수
        room_ref = firestore_client.collection("Room").document(room_id) # 데이터베이스 정보 업데이트
        room_ref.update({"RoomState": True})
        room_data = room_ref.get().to_dict()
        # 현재 방에 대한 정보를 모든 플레이어들에게 전달
        await room.broadcast(RoomInfo(
                                    type = "roomInfo",
                                    room = room_data
                                ))

        return {"message": f"Game started for Room '{room_id}'"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 파이어베이스 사용하지 않는 API 주석처리
'''
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
'''