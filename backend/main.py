from fastapi import FastAPI
from pydantic import BaseModel
import firebase_config  # Firebase √ ±‚»≠

app = FastAPI(
    title="My API",
    description="This is my custom API documentation",
    version="1.0.0"
)

class Item(BaseModel):
    name: str
    price: float
    description: str = None

@app.get("/")
async def root():
    return {"message": "Hello, Firebase with FastAPI!"}

@app.post("/items/", tags=["root"])
def create_item(item: Item):
    return {"item": item}
