# 🧠 AI Research Assistant

A full-stack RAG (Retrieval-Augmented Generation) application that lets you upload PDF documents and ask questions about them in a chat interface. Answers are grounded strictly in the uploaded document — no hallucination.

> ⚠️ **Demo uses a local backend.** The frontend is deployed on Vercel, but the embedding model (`bge-small-en-v1.5`) exceeds Render's free tier RAM limit (512MB), so full cloud deployment requires a paid instance. The demo below was recorded with a local backend.

---

## 📸 Demo

https://github.com/user-attachments/assets/3f714bc0-3173-4ba1-8754-d6bc48ee7d6b

---

## 🚀 Features

- 📄 Upload PDF documents via chat interface
- 🔍 Automatic text extraction, chunking, and embedding
- 🧠 Semantic search with ChromaDB vector store
- 🤖 LLM-powered answers via OpenRouter API
- 💬 Real-time chat UI built with Next.js
- 🔒 Answers grounded strictly in document context

---

## 🏗️ Architecture

```
User uploads PDF
      ↓
FastAPI Backend
      ↓ PyMuPDF extracts text
      ↓ tiktoken splits into overlapping chunks (500 tokens, 100 overlap)
      ↓ bge-small-en-v1.5 generates embeddings
      ↓
ChromaDB (local vector store)

User asks question
      ↓
Question is embedded → top 5 chunks retrieved from ChromaDB
      ↓
Chunks injected into prompt → sent to OpenRouter LLM
      ↓
Answer returned to chat UI
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | FastAPI, Python |
| Embeddings | `BAAI/bge-small-en-v1.5` (SentenceTransformers) |
| Vector DB | ChromaDB (persistent local) |
| LLM | OpenRouter API |
| PDF Parsing | PyMuPDF |
| Tokenization | tiktoken (`cl100k_base`) |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/xCamelot2001/ai-research-assistant.git
cd ai-research-assistant
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
OPENROUTER_API_KEY=your_api_key_here
```

Start the backend:

```bash
uvicorn api:app --reload
```

Backend runs at `http://127.0.0.1:8000`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## 🌐 Usage

1. Open the app in your browser
2. Upload a PDF using the upload button in the chat
3. Wait for the confirmation message
4. Ask questions about the document in natural language
5. Receive answers grounded in the document content

---

## ⚠️ Deployment Notes

- The local embedding model (`bge-small-en-v1.5`) requires ~600MB RAM, which exceeds Render's free tier (512MB)
- To deploy the backend on a free tier, replace `SentenceTransformer` with an API-based embedding service (e.g. OpenAI `text-embedding-3-small` or Cohere)
- ChromaDB uses local persistent storage — for cloud deployment this should be replaced with a hosted vector DB (e.g. Pinecone, Qdrant)
- Frontend is fully deployed on Vercel

---

## 💡 Future Improvements

- [ ] Switch to API-based embeddings for full cloud deployment
- [ ] Multi-document support
- [ ] Streaming LLM responses
- [ ] Hosted vector database (Pinecone / Qdrant)
- [ ] User authentication
- [ ] Conversation memory across sessions

---

## 👨‍💻 Author

**Hossein Khaneh Masjedi**

- GitHub: [@xCamelot2001](https://github.com/xCamelot2001)
- LinkedIn: [Hossein Khaneh Masjedi](https://www.linkedin.com/in/hosseinkhanehmasjedi)
