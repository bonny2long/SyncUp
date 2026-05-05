import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Send,
  Paperclip,
  Loader2,
  File,
  Image,
  X,
  Target,
  HeartHandshake,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import {
  fetchDMMessages,
  sendMessage,
  fetchDMUsers,
  uploadFile,
  getAvatarUrl,
} from "../../utils/api";
import RoleBadge from "../../components/shared/RoleBadge";
import EncouragementBoard from "../../components/community/EncouragementBoard";
import CohortChat from "./CohortChat";

export default function InternLobby() {
  const { user } = useUser();
  const { addToast } = useToast();
  const location = useLocation();
  const [dmUsers, setDmUsers] = useState([]);
  const [activeDM, setActiveDM] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lobbyTab, setLobbyTab] = useState("connections"); // "connections" | "cohort"
  const fileInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
      <div
        className={`${sizeClasses[size]} bg-surface-highlight rounded-full flex items-center justify-center overflow-hidden text-neutral-dark`}
      >
        {imageUrl ?
          <img
            src={imageUrl}
            alt={avatarUser?.name || "User avatar"}
            className="w-full h-full object-cover"
          />
        : getInitials(avatarUser?.name)}
      </div>
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const loadDMMessages = useCallback(
    async (dmUserId) => {
      if (!dmUserId || !user?.id) return;
      try {
        const data = await fetchDMMessages(dmUserId, user.id);
        setMessages(data);
      } catch (err) {
        console.error("Error loading DM messages:", err);
      }
    },
    [user?.id],
  );

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const dmUsersData = await fetchDMUsers(user.id, "lobby");
      setDmUsers(dmUsersData);

      // Check URL search params for auto-selecting a user
      const searchParams = new URLSearchParams(location.search);
      const urlUserId = searchParams.get("user");
      
      if (urlUserId) {
        const targetDMUser = dmUsersData.find((u) => u.id === Number(urlUserId));
        if (targetDMUser) {
          setActiveDM(targetDMUser);
          return;
        }
      }
      
      // Select first DM user as fallback
      setActiveDM((prev) => prev || dmUsersData[0] || null);

    } catch (err) {
      console.error("Error loading lobby data:", err);
      addToast("Failed to load lobby", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, location.search, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setDmUsers([]);
      setMessages([]);
      setActiveDM(null);
      return;
    }
    loadData();
  }, [loadData, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      if (activeDM?.id) {
        loadDMMessages(activeDM.id);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeDM?.id, loadDMMessages, user?.id]);

  useEffect(() => {
    if (activeDM?.id) {
      loadDMMessages(activeDM.id);
      return;
    }
    setMessages([]);
  }, [activeDM?.id, loadDMMessages]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;
    if (!activeDM) {
      addToast("Select someone to message first", "error");
      return;
    }

    try {
      setSending(true);
      let fileUrl = null;
      let fileName = null;

      if (selectedFile) {
        setUploading(true);
        try {
          const uploadResult = await uploadFile(selectedFile);
          fileUrl = uploadResult.file_url;
          fileName = uploadResult.file_name;
        } catch (uploadErr) {
          console.error("File upload failed:", uploadErr);
          addToast("File upload failed", "error");
        } finally {
          setUploading(false);
        }
      }

      const messageContent = newMessage.trim() || (fileUrl ? "Sent a file" : "");
      if (!messageContent) return;

      const message = await sendMessage(
        messageContent,
        null,
        activeDM.id,
        user.id,
        fileUrl,
        fileName,
      );

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      addToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectedDM = dmUsers.find((dmUser) => dmUser.id === activeDM?.id) || activeDM;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="page-shell flex h-[calc(100vh-120px)] flex-col animate-fade-in">
      <div className="brand-card mb-3 flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black text-neutral-dark">
                Intern Lobby
              </h1>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                {user?.cycle || "Cycle not set"}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-text-secondary">
              Mentors, admins, and cohort support in one place.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 rounded-lg border border-border bg-surface-highlight p-1">
          <button
            onClick={() => setLobbyTab("connections")}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              lobbyTab === "connections" ?
                "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:bg-surface hover:text-neutral-dark"
            }`}
          >
            Connections
          </button>
          <button
            onClick={() => setLobbyTab("cohort")}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
              lobbyTab === "cohort" ?
                "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:bg-surface hover:text-neutral-dark"
            }`}
          >
            Cohort
          </button>
        </div>
      </div>

      <div className="mb-3">
        <EncouragementBoard targetCycle={user?.cycle} mode="read" compact />
      </div>

      {lobbyTab === "connections" ? (
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Main Chat Panel */}
          <div className="brand-card flex flex-1 flex-col overflow-hidden">
            {selectedDM ?
              <>
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border bg-surface-highlight/40 px-4 py-3">
                  <div className="relative">
                    <UserAvatar user={selectedDM} size="md" />
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        selectedDM.status === "online" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-dark text-lg">
                        {selectedDM.name}
                      </span>
                      <RoleBadge role={selectedDM.role} size="xs" />
                    </div>
                    {selectedDM.status === "online" ?
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    : <span className="text-xs text-text-secondary">Offline</span>}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 space-y-6 overflow-y-auto bg-neutralLight/60 p-6">
                  {messages.length > 0 ?
                    messages.map((message) => {
                      const isMe = message.sender_id === user.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div className="w-8 h-8 flex-shrink-0">
                            {!isMe && (
                              <UserAvatar
                                user={{
                                  name: message.sender_name,
                                  profile_pic: message.sender_pic,
                                }}
                                size="md"
                              />
                            )}
                          </div>

                          <div
                            className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-baseline gap-2 mb-1.5">
                              {!isMe && (
                                <span className="font-semibold text-sm text-neutral-dark">
                                  {message.sender_name}
                                </span>
                              )}
                              <span className="text-xs text-text-secondary font-medium">
                                {formatTime(message.created_at)}
                              </span>
                            </div>

                            <div
                              className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                                isMe ?
                                  "bg-primary text-white rounded-br-sm"
                                : "bg-surface text-neutral-dark rounded-bl-sm border border-border"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">
                                  {message.content}
                              </p>
                              {message.file_url && (
                                <a
                                  href={message.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`block mt-2 text-sm font-medium hover:underline flex items-center gap-1.5 ${
                                    isMe ? "text-white/80" : "text-[#b9123f]"
                                  }`}
                                >
                                  <Paperclip className="w-4 h-4" />
                                  {message.file_name || "Attached File"}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center animate-fade-in">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <HeartHandshake className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-dark mb-2">Connect and Grow</h3>
                      <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                        You are now connected with <span className="font-semibold text-primary">{selectedDM.name}</span>. 
                        Reach out to ask technical questions, seek portfolio advice, or prepare for your upcoming sessions!
                      </p>
                      <div className="w-full rounded-lg border border-border bg-surface p-4 text-left shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-sm text-neutral-dark">Conversation Starters</span>
                        </div>
                        <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside">
                          <li>Could you review my latest project commit?</li>
                          <li>I am struggling with React state...</li>
                          <li>Any advice for my upcoming resume review?</li>
                        </ul>
                      </div>
                    </div>
                  }
                </div>

                {/* Input Area */}
                <div className="p-4 bg-surface border-t border-border">
                  {selectedFile && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-background rounded-lg border border-border inline-flex pr-4">
                      {selectedFile.type.startsWith("image/") ?
                        <Image className="w-4 h-4 text-gray-500" />
                      : <File className="w-4 h-4 text-gray-500" />}
                      <span className="text-sm font-medium text-neutral-dark max-w-[200px] truncate">
                        {selectedFile.name}
                      </span>
                      <button
                        onClick={clearSelectedFile}
                        className="ml-2 p-1 hover:bg-surface-highlight rounded-full transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-3.5 h-3.5 text-text-secondary hover:text-red-500" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(event) => {
                        if (event.target.files?.[0]) {
                          setSelectedFile(event.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 hover:bg-surface-highlight rounded-xl text-text-secondary transition-colors"
                      disabled={uploading}
                      title="Attach a file"
                    >
                      {uploading ?
                        <Loader2 className="w-5 h-5 animate-spin" />
                      : <Paperclip className="w-5 h-5 text-gray-400 hover:text-primary" />}
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                      placeholder={`Write a message to ${selectedDM.name}...`}
                      className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-[15px] text-neutral-dark outline-none transition-all placeholder-text-secondary focus:border-primary focus:ring-1 focus:ring-primary"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={(!newMessage.trim() && !selectedFile) || sending}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm font-medium flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </div>
              </>
            : <div className="flex h-full flex-col items-center justify-center bg-neutralLight/60">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="w-8 h-8 text-text-secondary opacity-50" />
                </div>
                <p className="text-text-secondary font-medium">Select a connection to start messaging</p>
              </div>}
          </div>

          {/* Connections List */}
          <div className="brand-card flex w-64 flex-shrink-0 flex-col overflow-hidden">
            <div className="border-b border-border bg-surface-highlight/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase text-text-secondary">
                  Connections
                </span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-text-secondary">
                  {dmUsers.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {dmUsers.length === 0 ?
                  <p className="p-3 text-sm text-text-secondary">
                    No active connections yet. Request a session through the
                    Mentorship Bridge.
                  </p>
                : dmUsers.map((dmUser) => (
                    <button
                      key={dmUser.id}
                      onClick={() => setActiveDM(dmUser)}
                      className={`flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm transition-all ${
                        activeDM?.id === dmUser.id ?
                          "bg-primary text-white shadow-sm"
                        : "text-neutral-dark hover:bg-surface-highlight"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <UserAvatar user={dmUser} size="sm" />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                            dmUser.status === "online" ?
                              "bg-green-500"
                            : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-semibold ${
                            activeDM?.id === dmUser.id ?
                              "text-white"
                            : "text-neutral-dark"
                          }`}
                        >
                          {dmUser.name}
                        </p>
                        <div className="mt-0.5">
                          <RoleBadge role={dmUser.role} size="xs" />
                        </div>
                      </div>
                    </button>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CohortChat cycleId={user?.intern_cycle_id} cycle={user?.cycle} />
      )}
    </div>
  );
}
