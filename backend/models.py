# models.py

from pydantic import BaseModel
from typing import Dict, List

class BaseMessage(BaseModel):
    type: str  # ���� ��� 'chat', 'game_start', 'game_end' ���� Ÿ���� ǥ��

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

# API �Է� �� ��ȯ ��

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