from fastapi import FastAPI
from pydantic import BaseModel
from rag.pipeline import run_rag

app = FastAPI()

class Query(BaseModel):
    question: str

@app.post("/chat")
def chat(query: Query):
    answer = run_rag(query.question)
    return {"answer": answer}