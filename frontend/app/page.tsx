"use client";

import { useState, useRef, useEffect } from "react";
import Grainient from "../components/Grainient";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  time: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "1", title: "Dark UI design feedback", time: "Just now" },
  { id: "2", title: "Quarterly report summary", time: "2 hrs ago" },
  { id: "3", title: "Python script for data...", time: "Yesterday" },
  { id: "4", title: "Email draft to the client", time: "Yesterday" },
  { id: "5", title: "Marketing copy ideas", time: "Mon" },
  { id: "6", title: "Trip planning — Tokyo", time: "Sat" },
  { id: "7", title: "Resume review", time: "Apr 12" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "bot",
    content:
      "Hello! How can I help you today? Feel free to ask me anything or upload a file to get started.",
  },
];

function Avatar({
  role,
  initials,
}: {
  role: "user" | "bot";
  initials: string;
}) {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 500,
        background:
          role === "bot" ? "rgba(255,255,255,0.08)" : "rgba(120,70,255,0.3)",
        border: `0.5px solid ${role === "bot" ? "rgba(255,255,255,0.1)" : "rgba(150,100,255,0.35)"}`,
        color: role === "bot" ? "#aaa" : "#d4baff",
      }}
    >
      {initials}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        alignItems: "center",
        padding: "12px 14px",
      }}
    >
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#aaa",
            display: "inline-block",
            animation: `blink 1.4s ${delay}ms infinite`,
          }}
        />
      ))}
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="14" y1="2" x2="7" y2="9" />
      <polygon
        points="14 2 9.5 14 7 9 2 6.5 14 2"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.5 9.5v2.5a1.5 1.5 0 01-1.5 1.5H4a1.5 1.5 0 01-1.5-1.5V9.5" />
      <polyline points="10.5 5 8 2.5 5.5 5" />
      <line x1="8" y1="2.5" x2="8" y2="10.5" />
    </svg>
  );
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState("1");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);

    try {
      const res = await fetch(
        "https://ai-research-assistant-g3t1.onrender.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: text }),
        },
      );

      const data = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.answer,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("CHAT ERROR:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          content: "Something went wrong ❌",
        },
      ]);
    }

    setIsTyping(false);
  };

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New conversation",
      time: "Just now",
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setMessages(INITIAL_MESSAGES);
  };

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Uploading:", file);

    // show in chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: `📎 Uploading: ${file.name}`,
      },
    ]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://ai-research-assistant-g3t1.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Upload failed");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          content: `✅ Uploaded and processed: ${file.name}`,
        },
      ]);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          content: `❌ Upload failed`,
        },
      ]);
    }

    e.target.value = "";
  };

  return (
    <>
      <style>{`
        @keyframes blink { 0%,80%,100%{opacity:0.3} 40%{opacity:1} }
        .chat-item:hover { background: rgba(255,255,255,0.06); }
        .new-chat-btn:hover { background: rgba(255,255,255,0.08); }
        .icon-btn:hover { background: rgba(255,255,255,0.08); color: #ccc; }
        .send-btn:hover { background: rgba(130,90,255,0.4); }
        .messages-scroll::-webkit-scrollbar, .chat-list::-webkit-scrollbar { width: 3px; }
        .messages-scroll::-webkit-scrollbar-track, .chat-list::-webkit-scrollbar-track { background: transparent; }
        .messages-scroll::-webkit-scrollbar-thumb, .chat-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        textarea::placeholder { color: rgba(255,255,255,0.25); }
        textarea { font-family: inherit; }
      `}</style>

      {/* Grainient background — full viewport */}
      <div style={{ width: "100%", height: "100vh", position: "relative" }}>
        <Grainient
          color1="#2a2530"
          color2="#4a4358"
          color3="#8a7fa0"
          timeSpeed={0.2}
          colorBalance={-0.07}
          warpStrength={2}
          warpFrequency={7}
          warpSpeed={2}
          warpAmplitude={21}
          blendAngle={124}
          blendSoftness={0.8}
          rotationAmount={500}
          noiseScale={2.25}
          grainAmount={0.22}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.5}
        />

        {/* Chat UI overlaid on top */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            fontFamily: "system-ui, sans-serif",
            color: "#d0d0d0",
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: 240,
              background: "rgba(20,10,40,0.55)",
              backdropFilter: "blur(16px)",
              borderRight: "0.5px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "16px 14px 12px",
                borderBottom: "0.5px solid rgba(255,255,255,0.08)",
              }}
            >
              <button
                className="new-chat-btn"
                onClick={handleNewChat}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.07)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#e0e0e0",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.15s",
                }}
              >
                <span style={{ fontSize: 16, color: "#aaa", lineHeight: 1 }}>
                  +
                </span>
                New conversation
              </button>
            </div>

            <div
              style={{
                padding: "12px 14px 4px",
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Recent
            </div>

            <div
              className="chat-list"
              style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}
            >
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="chat-item"
                  onClick={() => setActiveConvId(conv.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 7,
                    cursor: "pointer",
                    marginBottom: 2,
                    background:
                      conv.id === activeConvId
                        ? "rgba(255,255,255,0.08)"
                        : "transparent",
                    transition: "background 0.12s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "#ccc",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {conv.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.3)",
                      marginTop: 2,
                    }}
                  >
                    {conv.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main chat area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            {/* Top bar */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "0.5px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(10,5,25,0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span style={{ fontSize: 14, color: "#ccc", fontWeight: 500 }}>
                Assistant
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#3ecf8e",
                    display: "inline-block",
                  }}
                />
                Online
              </span>
            </div>

            {/* Messages */}
            <div
              className="messages-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    gap: 10,
                    maxWidth: "78%",
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  }}
                >
                  <Avatar
                    role={msg.role}
                    initials={msg.role === "bot" ? "AI" : "JD"}
                  />
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      ...(msg.role === "bot"
                        ? {
                            background: "rgba(255,255,255,0.07)",
                            border: "0.5px solid rgba(255,255,255,0.1)",
                            color: "#ddd",
                            borderTopLeftRadius: 3,
                            backdropFilter: "blur(8px)",
                          }
                        : {
                            background: "rgba(120,70,255,0.25)",
                            border: "0.5px solid rgba(150,100,255,0.3)",
                            color: "#e8d8ff",
                            borderTopRightRadius: 3,
                            backdropFilter: "blur(8px)",
                          }),
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    maxWidth: "78%",
                    alignSelf: "flex-start",
                  }}
                >
                  <Avatar role="bot" initials="AI" />
                  <div
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "0.5px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      borderTopLeftRadius: 3,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "0.5px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                background: "rgba(10,5,25,0.3)",
                backdropFilter: "blur(12px)",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.07)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 6,
                  padding: "8px 10px",
                }}
              >
                <button
                  className="icon-btn"
                  onClick={handleFileClick}
                  title="Upload file"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "transparent",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    color: "#888",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.12s, color 0.12s",
                  }}
                >
                  <UploadIcon />
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Message…"
                  rows={1}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#e0d8ff",
                    fontSize: 13.5,
                    resize: "none",
                    lineHeight: 1.5,
                    maxHeight: 120,
                    minHeight: 22,
                  }}
                />
              </div>
              <button
                className="send-btn"
                onClick={sendMessage}
                title="Send"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "rgba(110,60,255,0.35)",
                  border: "0.5px solid rgba(150,100,255,0.4)",
                  color: "#c9aaff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
