import React, { useState, useRef, useEffect } from "react";

/**
 * ChatWidget.jsx
 * ----------------
 * A floating/embeddable chat widget that talks to the MediTrack Booking
 * Assistant backend (/chat endpoint). Handles conversation history itself -
 * sends the full message array with each request, and stores whatever the
 * backend returns.
 *
 * Usage:
 *   import ChatWidget from "./ChatWidget";
 *   <ChatWidget apiUrl="http://localhost:8000/chat" />
 *
 * Once your FastAPI backend is deployed behind API Gateway, change apiUrl
 * to your real endpoint, e.g.:
 *   https://your-api-id.execute-api.ap-south-1.amazonaws.com/chat
 */

const theme = {
  bg: "#0A2224",
  panelBg: "#0F2E30",
  accent: "#22D3AE",
  text: "#E6F4F3",
  subtext: "#7FA9A6",
  userBubble: "#22D3AE",
  userBubbleText: "#0A2224",
  botBubble: "#123B3D",
};

// Role-specific greeting + example prompts shown when the chat opens.
// NOTE: only "book_appointment" is a real, working tool on the backend right
// now (see app.py). The other roles' examples below are aspirational -
// they'll need matching tools added server-side before they actually work.
// This still gives each role a tailored, relevant-feeling welcome message.
const ROLE_CONFIG = {
  receptionist: {
    title: "MediTrack Booking Assistant",
    greeting: "Hi! I can help you book patient appointments quickly.",
    examples: [
      "Book an appointment for PAT-004 with Dr. Sharma tomorrow at 5pm",
      "Schedule PAT-002 with Dr. Iyer this Friday at 2:30pm",
    ],
  },
  nurse: {
    title: "MediTrack Vitals Assistant",
    greeting: "Hi! I can help you check current patient vitals and status.",
    examples: [
      "What's the current heart rate for PAT-004?",
      "Is anyone currently flagged with an alert?",
    ],
  },
  doctor: {
    title: "MediTrack Clinical Assistant",
    greeting: "Hi! I can help you look up patient vitals and manage appointments.",
    examples: [
      "Give me the full vitals for PAT-004",
      "Book a follow-up for PAT-002 next Monday at 11am",
    ],
  },
  admin: {
    title: "MediTrack Admin Assistant",
    greeting: "Hi! I have full visibility - vitals, rooms, storage, beds, and bookings.",
    examples: [
      "How many beds are vacant in Ward 4B?",
      "Any alerts across patients, rooms, or medicine storage right now?",
    ],
  },
  pharmacist: {
    title: "MediTrack Pharmacy Assistant",
    greeting: "Hi! I can help you check medicine storage conditions.",
    examples: [
      "What's the current temperature in the medicine cold storage?",
      "Are there any storage alerts right now?",
    ],
  },
};

const DEFAULT_CONFIG = {
  title: "MediTrack Assistant",
  greeting: "Hi! How can I help you today?",
  examples: ["Book an appointment for PAT-004 with Dr. Sharma tomorrow at 5pm"],
};

export default function ChatWidget({ apiUrl = "http://localhost:8000/chat", role }) {
  const config = ROLE_CONFIG[role] || DEFAULT_CONFIG;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]); // {role, content} pairs shown in the UI
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newUserMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, role }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      // Only keep role/content pairs with actual text for display
      // (the backend's "messages" also includes tool-call bookkeeping,
      // but we just need the conversation the user can read).
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError("Something went wrong reaching the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: theme.accent,
          border: "none",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          cursor: "pointer",
          fontSize: "26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label={`Open ${config.title}`}
      >
        🤖
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "380px",
        height: "520px",
        backgroundColor: theme.bg,
        borderRadius: "16px",
        border: `1px solid ${theme.botBubble}`,
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          backgroundColor: theme.panelBg,
          borderBottom: `1px solid ${theme.botBubble}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ color: theme.accent, fontWeight: 700, fontSize: "15px" }}>
            {config.title}
          </div>
          <div style={{ color: theme.subtext, fontSize: "12px", marginTop: "2px" }}>
            {config.greeting}
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: theme.subtext,
            fontSize: "18px",
            cursor: "pointer",
            lineHeight: 1,
            padding: "2px 6px",
          }}
          aria-label="Minimize chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
            <div style={{ color: theme.subtext, fontSize: "13px", textAlign: "center", marginBottom: "6px" }}>
              {config.greeting}
            </div>
            <div style={{ color: theme.subtext, fontSize: "11px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Try asking
            </div>
            {config.examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setInput(example)}
                style={{
                  textAlign: "left",
                  backgroundColor: theme.botBubble,
                  color: theme.text,
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  cursor: "pointer",
                  lineHeight: "1.3",
                }}
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              backgroundColor: msg.role === "user" ? theme.userBubble : theme.botBubble,
              color: msg.role === "user" ? theme.userBubbleText : theme.text,
              padding: "10px 14px",
              borderRadius: "14px",
              borderBottomRightRadius: msg.role === "user" ? "4px" : "14px",
              borderBottomLeftRadius: msg.role === "user" ? "14px" : "4px",
              fontSize: "14px",
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: theme.botBubble,
              color: theme.subtext,
              padding: "10px 14px",
              borderRadius: "14px",
              fontSize: "13px",
              fontStyle: "italic",
            }}
          >
            Thinking...
          </div>
        )}

        {error && (
          <div
            style={{
              alignSelf: "center",
              color: "#F87171",
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px",
          borderTop: `1px solid ${theme.botBubble}`,
          backgroundColor: theme.panelBg,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            backgroundColor: theme.bg,
            color: theme.text,
            border: `1px solid ${theme.botBubble}`,
            borderRadius: "10px",
            padding: "10px 12px",
            fontSize: "14px",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            backgroundColor: theme.accent,
            color: theme.bg,
            border: "none",
            borderRadius: "10px",
            padding: "0 18px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}