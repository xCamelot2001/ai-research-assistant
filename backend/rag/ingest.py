import pymupdf
import tiktoken
from sentence_transformers import SentenceTransformer

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

# Check
print(f"Number of chunks: {len(chunks)}")
print(f"Embedding shape: {len(embeddings)} x {len(embeddings[0])}")