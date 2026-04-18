import chromadb
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import pymupdf
import tiktoken

# load models
embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")

chroma_client = chromadb.PersistentClient(path="rag/db")
collection = chroma_client.get_or_create_collection(name="research_papers")

model_name = "Qwen/Qwen2.5-1.5B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model_llm = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="auto"
)

def ingest_pdf(file_path):
    print("Processing PDF:", file_path)

    # load pdf
    doc = pymupdf.open(file_path)

    text = ""
    for page in doc:
        text += page.get_text()

    # chunk
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)

    chunks = []
    chunk_size = 200
    overlap = 50
    start = 0

    while start < len(tokens):
        chunk_tokens = tokens[start:start + chunk_size]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
        start += chunk_size - overlap

    print("Chunks created:", len(chunks))

    # embed
    embeddings = embedding_model.encode(
        ["Represent this sentence for retrieval: " + c for c in chunks]
    )

    # store
    collection.add(
        embeddings=embeddings,
        documents=chunks,
        ids=[f"{file_path}_{i}" for i in range(len(chunks))]
    )

    print("Stored in DB ✅")

    
def run_rag(query):

    query_embedding = embedding_model.encode(
        "Represent this sentence for retrieval: " + query
    )

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    retrieved_chunks = results["documents"][0]
    context = "\n\n".join(retrieved_chunks[:2])

    print("QUERY:", query)
    print("RETRIEVED:", retrieved_chunks)
    
    prompt = f"""
    You are a strict AI research assistant.

    You MUST answer ONLY using the provided context.
    If the answer is not explicitly in the context, say:
    "I don't know based on the provided document."

    Do NOT use prior knowledge.
    Do NOT make assumptions.

    Context:
    {context}

    Question:
    {query}

    Answer:
    """

    inputs = tokenizer(prompt, return_tensors="pt").to(model_llm.device)

    outputs = model_llm.generate(
        **inputs,
        max_new_tokens=200,
        temperature=0.7,
        do_sample=True
    )

    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    answer = answer.split("Answer:")[-1].strip()

    return answer