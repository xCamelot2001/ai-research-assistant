"use client";

import { useState, useRef, useEffect } from "react";
import DarkVeil from "../components/DarkVeil";

// ✅ define message type
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  // ✅ fix typing
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const uploadPDF = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });

    alert("PDF uploaded!");
  };

  // ✅ fix ref typing
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      console.error(err);
    }

    setInput("");
    setLoading(false);
  };

  // ✅ auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* ✅ BACKGROUND FIX */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
        }}
      >
        <DarkVeil />
      </div>

      {/* ✅ MAIN UI */}
      <div
        style={{
          maxWidth: 700,
          margin: "auto",
          padding: 20,
          marginTop: 40,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)",
          borderRadius: 20,
          color: "white",
        }}
      >
        <h1 style={{ textAlign: "center" }}>AI Research Assistant</h1>

        <div style={{ minHeight: "70vh", marginBottom: 20 }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  background:
                    msg.role === "user" ? "#0070f3" : "rgba(255,255,255,0.1)",
                  color: "white",
                  padding: "10px 15px",
                  borderRadius: 15,
                  maxWidth: "70%",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && <p>Thinking...</p>}

          <div ref={bottomRef} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "white",
            }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <div style={{ marginBottom: 20 }}>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button onClick={uploadPDF}>Upload PDF</button>
          </div>

          <button
            onClick={sendMessage}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: "black",
              color: "white",
              border: "1px solid white",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
