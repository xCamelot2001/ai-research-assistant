# 🧠 AI Research Assistant (RAG App)

A full-stack AI application that allows users to upload documents (PDFs) and ask questions about them using Retrieval-Augmented Generation (RAG).

Built with modern AI tooling and production-style architecture.

---

## 🚀 Features

- 📄 Upload PDF documents
- 🔍 Intelligent document chunking & embedding
- 🧠 Semantic search using vector database (ChromaDB)
- 🤖 LLM-powered question answering via OpenRouter API
- 💬 Chat-style interface (Next.js frontend)
- ⚡ Real-time responses based on document context

---

## 🏗️ Architecture

```text
Frontend (Next.js)
        ↓
FastAPI Backend
        ↓
ChromaDB (Vector Store)
        ↓
Embedding Model (SentenceTransformers)
        ↓
OpenRouter API (LLM)
```

---

## 🧠 How It Works

1. **Upload Document**
   - PDF is parsed using PyMuPDF
   - Text is extracted

2. **Chunking**
   - Text is split into overlapping token chunks
   - Improves retrieval accuracy

3. **Embeddings**
   - Each chunk is converted into vector embeddings
   - Stored in ChromaDB

4. **Query**
   - User question is embedded
   - Top relevant chunks are retrieved

5. **RAG**
   - Retrieved context is injected into prompt
   - LLM generates answer based ONLY on document

---

## 🛠️ Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript

### Backend

- FastAPI
- Python

### AI / ML

- SentenceTransformers (Embeddings)
- ChromaDB (Vector DB)
- OpenRouter API (LLM access)

### Other

- PyMuPDF (PDF parsing)
- tiktoken (tokenization)

---

## 📦 Installation

### 1. Clone repo

```bash
git clone https://github.com/your-username/ai-research-assistant.git
cd ai-research-assistant
```

---

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file:

```env
OPENROUTER_API_KEY=your_api_key
```

Run backend:

```bash
uvicorn api:app --reload
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Usage

1. Upload a PDF file
2. Ask questions in chat
3. Get answers grounded in document context

---

## ⚠️ Notes

- Backend currently uses local embeddings (may require sufficient RAM)
- Free hosting platforms may require using API-based embeddings
- Designed for demonstration and experimentation

---

## 📸 Demo

![AI Research Assistant UI](backend/assests/demo.png)

https://github.com/user-attachments/assets/3f714bc0-3173-4ba1-8754-d6bc48ee7d6b

---

## 💡 Future Improvements

- User authentication
- Multi-document support
- Streaming responses
- Cloud vector database
- Deployment optimizations

---

## 👨‍💻 Author

- GitHub: https://github.com/xCamelot2001
- LinkedIn: https://www.linkedin.com/in/hosseinkhanehmasjedi

---
