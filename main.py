from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="My API",
    description="This is my custom API documentation",
    version="1.0.0"
)


class Item(BaseModel):
    name: str
    price: float
    description: str = None

@app.post("/items/")
def create_item(item: Item):
    return {"item": item}
