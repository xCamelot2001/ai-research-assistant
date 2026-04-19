from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from rag.pipeline import run_rag, ingest_pdf
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uuid
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str

@app.post("/chat")
def chat(query: Query):
    answer = run_rag(query.question)
    return {"answer": answer}


@app.post("/upload")
async def upload(file: UploadFile):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    upload_dir = os.path.join(BASE_DIR, "rag", "uploads")

    os.makedirs(upload_dir, exist_ok=True)

    # unique filename
    file_path = os.path.join(upload_dir, f"{uuid.uuid4()}_{file.filename}")

    # SAVE FILE TO DISK
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("Saved file to:", file_path)

    # process it
    ingest_pdf(file_path)

    return {"message": "uploaded + processed"}