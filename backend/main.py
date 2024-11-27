from fastapi import FastAPI, HTTPException
from firebase_config import firestore_client
from firebase_config import realtime_db
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="My API with Response Models",
    description="This API demonstrates how to define response types using response_model.",
    version="1.0.0"
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
@app.post("/firebase/User/", tags=["Firebase"], summary="Create an User", response_model=UserModel)
async def add_item_to_firestore(data: UserModel):
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
@app.get("/firebase/User/{item_id}", tags=["Firebase"], summary="Get User by UserID", response_model=UserModel)
async def get_item_from_firestore(user_id: str):
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

@app.put("/firebase/User/{item_id}", tags=["Firebase"])
async def update_room_from_firestore(item_id: str, update_data: dict):
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

@app.get("/test/", tags=["FirebaseTest"])
async def root():
    return {"message": "Hello, Firebase with FastAPI!"}


@app.post("/items/", tags=["Items"], summary="Create an Item", response_model=ItemResponse)
def create_item(item: Item):
    """
    Create a new item and return the created item with an ID.
    """
    
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
