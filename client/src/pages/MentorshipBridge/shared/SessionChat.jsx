import React, { useCallback, useState, useEffect, useRef } from "react";
import { useUser } from "../../../context/UserContext";
import { Send, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const getApiErrorMessage = async (res, fallback) => {
  try {
    const data = await res.json();
    if (data?.error) return data.error;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors.map((error) => error.msg).join(". ");
    }
  } catch {
    // Fall back to the generic message below when the response is not JSON.
  }
  return fallback;
};

export default function SessionChat({ otherUser }) {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [sendError, setSendError] = useState(null);
  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!user?.id || !otherUser?.id) return;

    try {
      const res = await fetch(
        `${API_BASE}/chat/dm/${otherUser.id}?currentUserId=${user.id}`
      );
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, "Failed to load messages"));
      }
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      setLoadError(null);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setLoadError(err.message || "Could not load messages");
    } finally {
      setLoading(false);
    }
  }, [otherUser?.id, user?.id]);

  useEffect(() => {
    if (user?.id && otherUser?.id && expanded) {
      setLoading(true);
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id, otherUser?.id, expanded, loadMessages]);

  useEffect(() => {
    if (expanded) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, expanded]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    setSendError(null);
    const optimistic = {
      id: Date.now(),
      content: newMessage,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");

    try {
      const res = await fetch(`${API_BASE}/chat/messages?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: optimistic.content,
          recipient_id: otherUser.id,
        }),
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, "Failed to send message"));
      }
      // Refresh to get real message from server
      await loadMessages();
    } catch (err) {
      console.error("Failed to send:", err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => !m._optimistic));
      setNewMessage(optimistic.content);
      setSendError(err.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2 border border-border rounded-lg overflow-hidden bg-surface">
      {/* Collapsible Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-highlight hover:bg-border/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-neutral-dark">
            Message {otherUser.role === "intern" ? otherUser.name : otherUser.name}
          </span>
          {messages.length > 0 && (
            <span className="text-xs text-text-secondary">
              ({messages.length})
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-secondary" />
        )}
      </button>

      {/* Chat Body */}
      {expanded && (
        <>
          {/* Messages Area */}
          <div className="flex flex-col gap-2 p-3 overflow-y-auto max-h-60 min-h-[80px] bg-surface">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : loadError ? (
              <p className="text-xs text-red-500 text-center py-3">
                {loadError}
              </p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-4">
                No messages yet — start the conversation!
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                        isMe
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-surface-highlight text-neutral-dark rounded-bl-none border border-border"
                      } ${msg._optimistic ? "opacity-70" : ""}`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          isMe ? "text-white/60" : "text-text-secondary"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-2 border-t border-border bg-surface">
            <div className="flex-1">
              {sendError && (
                <p className="mb-1 text-xs text-red-500" role="alert">
                  {sendError}
                </p>
              )}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  if (sendError) setSendError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={`Message ${otherUser.name}...`}
                className="w-full px-3 py-1.5 text-sm border border-border rounded-lg bg-surface-highlight text-neutral-dark placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={sending}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="self-end p-2 bg-primary text-white rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
