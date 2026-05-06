import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Users, MessageSquare, Loader2 } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { fetchCohortMessages, sendCohortMessage, fetchCohortUsers, getAvatarUrl } from "../../utils/api";

export default function CohortChat({ cycleId, cycle }) {
  const { user } = useUser();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [cohortUsers, setCohortUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pollingPaused, setPollingPaused] = useState(false);
  const messagesEndRef = useRef(null);
  const pollFailureCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadCohortData = useCallback(async () => {
    if (!cycleId) return;
    try {
      setLoading(true);
      const [msgData, userData] = await Promise.all([
        fetchCohortMessages(cycleId),
        fetchCohortUsers(cycleId)
      ]);
      setMessages(msgData);
      setCohortUsers(userData);
      pollFailureCountRef.current = 0;
      setPollingPaused(false);
    } catch (err) {
      console.error("Failed to load cohort data:", err);
      // Don't show toast for interval polls to avoid spamming
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    if (!cycleId) {
      setLoading(false);
      return undefined;
    }

    loadCohortData();
    const interval = setInterval(() => {
      if (pollFailureCountRef.current >= 3) return;

      // Background poll for new messages
      fetchCohortMessages(cycleId)
        .then((data) => {
          setMessages(data);
          pollFailureCountRef.current = 0;
          setPollingPaused(false);
        })
        .catch((err) => {
          console.error("Failed to refresh cohort messages:", err);
          pollFailureCountRef.current += 1;
          setPollingPaused(true);
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [cycleId, loadCohortData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const msg = await sendCohortMessage(cycleId, newMessage, user.id);
      setMessages((prev) => [...prev, msg]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send cohort message:", err);
      addToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const UserAvatar = ({ user: avatarUser, size = "md" }) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-9 h-9 text-sm",
      lg: "w-10 h-10 text-base",
    };

    let imageUrl = avatarUser?.profile_pic;
    if (imageUrl && imageUrl.startsWith("avatar:")) {
      imageUrl = getAvatarUrl(imageUrl.split(":")[1]);
    }

    return (
      <div className={`${sizeClasses[size]} bg-surface-highlight rounded-full flex items-center justify-center overflow-hidden text-neutral-dark border border-border`}>
        {imageUrl ? (
          <img src={imageUrl} alt={avatarUser?.name} className="w-full h-full object-cover" />
        ) : getInitials(avatarUser?.name)}
      </div>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <div className="brand-card flex h-64 flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        <p className="text-sm text-text-secondary">Loading cohort hub...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 gap-4 overflow-hidden animate-fade-in">
      {/* Main Chat Area */}
      <div className="brand-card flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-surface-highlight/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-neutral-dark">Cohort Channel: {cycle}</h2>
          </div>
          <span className="text-xs text-text-secondary font-medium px-2 py-1 bg-surface-highlight rounded-full">
            {cohortUsers.length} members online
          </span>
        </div>
        {pollingPaused && (
          <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600">
            Cohort messages could not refresh. Sending still works if the connection returns.
          </p>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-neutralLight/60 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-neutral-dark mb-1">Welcome to Cycle {cycle}!</h3>
              <p className="text-sm text-text-secondary max-w-xs">
                This is your private space to connect with fellow interns. Say hello, discuss your goals, and support each other!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <UserAvatar user={{ name: msg.sender_name, profile_pic: msg.sender_pic }} size="sm" />
                  <div className={`flex flex-col ${isMe ? "items-end text-right" : "items-start text-left"} max-w-[80%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isMe && <span className="text-xs font-bold text-neutral-dark">{msg.sender_name}</span>}
                      <span className="text-[10px] text-text-secondary">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                      isMe ? "bg-primary text-white rounded-tr-none" : "bg-surface text-neutral-dark border border-border rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-surface border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message your cohort..."
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-all flex items-center justify-center shadow-sm"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>

      {/* Members Sidebar */}
      <div className="brand-card hidden w-64 flex-col overflow-hidden md:flex">
        <div className="border-b border-border bg-surface-highlight/50 p-3">
          <h3 className="text-xs font-bold text-text-secondary uppercase">Cohort Members</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {cohortUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-highlight transition-colors cursor-default group">
                <UserAvatar user={u} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-dark truncate">{u.name}</p>
                  <p className="text-[10px] text-text-secondary font-medium">Intern</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
