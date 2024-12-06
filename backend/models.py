# models.py

from pydantic import BaseModel
from typing import Dict, List

class Message(BaseModel):
    sender: str
    text: str
    type: str  # ���� ��� 'chat', 'game_start', 'game_end' ���� Ÿ���� ǥ��



# API �Է� �� ��ȯ ��
    
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