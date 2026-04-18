import chromadb
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load embedding model
embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")

# Load vector DB
chroma_client = chromadb.PersistentClient(path="db")

collection = chroma_client.get_collection(name="research_papers")

# Load LLM
model_name = "Qwen/Qwen2.5-1.5B-Instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model_llm = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,
    device_map="auto"
)

# Memory
chat_history = []

while True:
    query = input("You: ")

    # store user message
    chat_history.append({"role": "user", "content": query})

    # embed query
    query_embedding = embedding_model.encode(
        "Represent this sentence for retrieval: " + query
    )

    # retrieve
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    retrieved_chunks = results["documents"][0]
    context = "\n\n".join(retrieved_chunks[:2])

    # build memory
    history_text = ""
    for msg in chat_history[-6:]:  # limit memory
        history_text += f"{msg['role']}: {msg['content']}\n"

    # prompt
    prompt = f"""
    You are an AI research assistant.

    Answer the question ONLY using the provided context.
    Do NOT use any outside knowledge.

    If the answer is not clearly stated in the context, say "I don't know".

    Be specific and base your answer strictly on the document.

    Conversation:
    {history_text}

    Context:
    {context}

    User: {query}
    Assistant:
    """

    # generate
    inputs = tokenizer(prompt, return_tensors="pt").to(model_llm.device)

    outputs = model_llm.generate(
        **inputs,
        max_new_tokens=200,
        temperature=0.7,
        do_sample=True
    )

    answer = tokenizer.decode(outputs[0], skip_special_tokens=True)
    answer = answer.split("Assistant:")[-1].strip()

    print("Assistant:", answer)

    # store assistant response
    chat_history.append({"role": "assistant", "content": answer})