from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import firebase_config  # Firebase �ʱ�ȭ

app = FastAPI(
    title="My API with Response Models",
    description="This API demonstrates how to define response types using response_model.",
    version="1.0.0"
)

# 데이터 모델 정의
class Item(BaseModel):
    name: str
    price: float
    description: str = None

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str = None
@app.get("/")
async def root():
    return {"message": "Hello, Firebase with FastAPI!"}


# Items 태그 예시
@app.post("/items/", tags=["Items"], summary="Create an Item", response_model=ItemResponse)
def create_item(item: Item):
    """
    Create a new item and return the created item with an ID.
    """
    # 여기서는 ID를 임의로 생성하여 응답 데이터에 추가합니다.
    return {"id": 1, **item.dict()}


@app.get("/items/{item_id}", tags=["Items"], summary="Get an Item", response_model=ItemResponse)
def read_item(item_id: int):
    """
    Retrieve an item by its ID.
    """
    return {
        "id": item_id,
        "name": "Sample Item",
        "price": 10.99,
        "description": "This is a sample item."
    }


@app.get("/items/", tags=["Items"], summary="Get All Items", response_model=List[ItemResponse])
def read_items():
    """
    Retrieve a list of all items.
    """
    return [
        {"id": 1, "name": "Item 1", "price": 10.99, "description": "This is item 1."},
        {"id": 2, "name": "Item 2", "price": 20.99, "description": "This is item 2."},
    ]


@app.put("/items/{item_id}", tags=["Items"], summary="Update an Item", response_model=ItemResponse)
def update_item(item_id: int, item: Item):
    """
    Update an existing item and return the updated item.
    """
    return {"id": item_id, **item.dict()}


@app.delete("/items/{item_id}", tags=["Items"], summary="Delete an Item", response_model=dict)
def delete_item(item_id: int):
    """
    Delete an item by its ID and return a confirmation message.
    """
    return {"message": f"Item with id {item_id} has been deleted."}
