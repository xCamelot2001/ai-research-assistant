import pymupdf
import tiktoken
from sentence_transformers import SentenceTransformer
import chromadb
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load LLM
model_name = "Qwen/Qwen2.5-1.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model_llm = AutoModelForCausalLM.from_pretrained(
    model_name,
    dtype=torch.float32,
    device_map="auto"
)

# create a chroma client + database
chroma_client = chromadb.PersistentClient(path="db")

try:
    collection = chroma_client.get_collection(name="research_papers")
except:
    collection = chroma_client.create_collection(name="research_papers")
    
# Load model
model = SentenceTransformer("BAAI/bge-small-en-v1.5")

# Load PDF
doc = pymupdf.open("Expert_Systems_with_Applications_Journal - double column.pdf")

text = ""
for page in doc:
    text += page.get_text()


# Chunking
def chunk_text_tokens(text, chunk_size=200, overlap=50):
    encoding = tiktoken.get_encoding("cl100k_base")
    tokens = encoding.encode(text)

    chunks = []
    start = 0

    while start < len(tokens):
        end = start + chunk_size
        chunk_tokens = tokens[start:end]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
        start += chunk_size - overlap

    return chunks


chunks = chunk_text_tokens(text)

# Embeddings
embeddings = model.encode(
    ["Represent this sentence for retrieval: " + chunk for chunk in chunks]
)

# storing in database
collection.add(
    embeddings=embeddings, documents=chunks, ids=[str(i) for i in range(len(chunks))]
)
