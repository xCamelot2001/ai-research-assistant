"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  // 🔥 UPLOAD FUNCTION
  const uploadPDF = async () => {
    console.log("UPLOAD BUTTON CLICKED");

    if (!file) {
      alert("No file selected");
      return;
    }

    console.log("Uploading file:", file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      console.log("STATUS:", res.status);

      const data = await res.json();
      console.log("RESPONSE:", data);

      alert("Upload successful");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    }
  };

  // 🔥 CHAT FUNCTION
  const sendMessage = async () => {
    if (!input) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);

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
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Research Assistant</h1>

      {/* 🔥 UPLOAD SECTION */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const selected = e.target.files?.[0] || null;
            console.log("SELECTED FILE:", selected);
            setFile(selected);
          }}
        />
        <button onClick={uploadPDF}>Upload PDF</button>
      </div>

      {/* 🔥 CHAT SECTION */}
      <div style={{ marginBottom: 20 }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>

      {/* 🔥 INPUT */}
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
