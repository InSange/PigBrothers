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

# Firestore에 데이터 추가
@app.post("/firebase/items/", tags=["Firebase"])
async def add_item_to_firestore(item: Item):
    """
    Add an item to Firestore.
    """
    doc_ref = firestore_client.collection("items").document()
    doc_ref.set(item.dict())
    return {"message": "Item added successfully", "id": doc_ref.id}

# Firestore에서 데이터 조회
@app.get("/firebase/items/{item_id}", tags=["Firebase"])
async def get_item_from_firestore(item_id: str):
    """
    Retrieve an item from Firestore by ID.
    """
    doc_ref = firestore_client.collection("items").document(item_id)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict()
    else:
        raise HTTPException(status_code=404, detail="Item not found")
    
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
