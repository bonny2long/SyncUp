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
        `${API_BASE}/chat/dm/${otherUser.id}?currentUserId=${user.id}`,
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
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* Collapsible Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-surface-highlight px-4 py-3 transition-colors hover:bg-primary/5"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-neutral-dark">
            Message {otherUser.name}
          </span>
          {messages.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              ({messages.length})
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-text-secondary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-secondary" />
        )}
      </button>

      {/* Chat Body */}
      {expanded && (
        <>
          {/* Messages Area */}
          <div className="flex max-h-60 min-h-[96px] flex-col gap-2 overflow-y-auto bg-surface p-3">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : loadError ? (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-700"
                role="alert"
              >
                {loadError}
              </p>
            ) : messages.length === 0 ? (
              <p className="py-5 text-center text-xs font-medium text-text-secondary">
                Start the conversation
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        isMe
                          ? "rounded-br-md bg-primary text-white"
                          : "rounded-bl-md border border-border bg-surface-highlight text-neutral-dark"
                      } ${msg._optimistic ? "opacity-70" : ""}`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
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
          <div className="flex gap-2 border-t border-border bg-surface p-3">
            <div className="flex-1">
              {sendError && (
                <p className="mb-2 text-xs font-semibold text-red-600" role="alert">
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
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder={`Message ${otherUser.name}...`}
                className="input w-full py-2 text-sm"
                disabled={sending}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="self-end rounded-full bg-primary p-2.5 text-white transition-colors hover:bg-primary-dark disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
