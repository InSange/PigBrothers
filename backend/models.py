# models.py

from pydantic import BaseModel
from typing import Dict, List

class Message(BaseModel):
    sender: str
    text: str
    type: str  # 예를 들어 'chat', 'game_start', 'game_end' 등의 타입을 표현



# API 입력 및 반환 모델
    
class RoomModel(BaseModel):
    MaxUser: int = 8  
    Name: str 
    RoomID: str    
    RoomState: bool = False 
    RoomHostID: str 
    UserList: List[str] = []

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