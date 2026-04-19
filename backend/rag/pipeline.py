import chromadb
from sentence_transformers import SentenceTransformer
import pymupdf
import tiktoken
import requests
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# LOAD EMBEDDING MODEL
embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")

# CHROMA DB
chroma_client = chromadb.PersistentClient(path="rag/db")
collection = chroma_client.get_or_create_collection(name="research_papers")


# LLM CALL
def call_llm(prompt):
    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "meta-llama/llama-3.3-70b-instruct:free",
            # OR: "openrouter/free"
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
    )

    data = response.json()

    return data["choices"][0]["message"]["content"]


# INGEST
def ingest_pdf(file_path):
    print("Processing PDF:", file_path)

    # CLEAR OLD DATA
    existing = collection.get()
    ids = existing.get("ids", [])

    if ids:
        collection.delete(ids=ids)
        print("Cleared old collection")

    # LOAD PDF
    doc = pymupdf.open(file_path)

    text = ""
    for page in doc:
        text += page.get_text()

    print("TEXT LENGTH:", len(text))

    # CHUNKING
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)

    chunks = []
    chunk_size = 500
    overlap = 100
    start = 0

    while start < len(tokens):
        chunk_tokens = tokens[start:start + chunk_size]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
        start += chunk_size - overlap

    print("Chunks created:", len(chunks))

    if len(chunks) == 0:
        print("No text found in PDF")
        return

    # EMBEDDINGS
    embeddings = embedding_model.encode(
        ["Represent this sentence for retrieval: " + c for c in chunks]
    )

    # STORE
    collection.add(
        embeddings=embeddings,
        documents=chunks,
        ids=[f"{file_path}_{i}" for i in range(len(chunks))]
    )

    print("Stored in DB")


# RAG
def run_rag(query):

    query_embedding = embedding_model.encode(
        "Represent this sentence for retrieval: " + query
    )

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=5
    )

    retrieved_chunks = results["documents"][0]

    if not retrieved_chunks:
        return "No relevant information found."

    context = "\n\n".join(retrieved_chunks)

    print("QUERY:", query)
    print("RETRIEVED:", retrieved_chunks)

    prompt = f"""
    You are a strict AI research assistant.

    You MUST answer ONLY using the provided context.
    If the answer is not explicitly in the context, say:
    "I don't know based on the provided document."

    Context:
    {context}

    Question:
    {query}

    Answer:
    """

    # USE API
    answer = call_llm(prompt)

    return answer