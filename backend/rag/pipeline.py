import chromadb
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# load models
embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")

chroma_client = chromadb.PersistentClient(path="rag/db")
collection = chroma_client.get_collection(name="research_papers")

model_name = "Qwen/Qwen2.5-1.5B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model_llm = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="auto"
)

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

    prompt = f"""
You are a helpful AI research assistant.

Answer using ONLY the context.

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