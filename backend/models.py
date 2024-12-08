# models.py

from pydantic import BaseModel
from typing import Dict, List

class BaseMessage(BaseModel):
    type: str  # 예를 들어 'chat', 'game_start', 'game_end' 등의 타입을 표현

class Alert(BaseMessage):
    text: str

class Chat(BaseMessage):
    userID: str
    text: str    

class State(BaseMessage):
    userID: str
    speak: bool

class Role(BaseMessage):
    userID: str
    role: str
    word: str

class Process(BaseMessage):
    state: str

# API 입력 및 반환 모델

class UserModel(BaseModel):
    Name: str
    UserID: str
    
class RoomModel(BaseModel):
    MaxUser: int = 8  
    Name: str 
    RoomID: str    
    RoomState: bool = False 
    RoomHostID: str 
    UserList: List[UserModel] = []

class Item(BaseModel):
    name: str
    price: float
    description: str = None

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str = None