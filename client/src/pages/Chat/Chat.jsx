import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import {
  fetchChannels,
  createChannel,
  fetchChannelMessages,
  fetchDMMessages,
  sendMessage,
  fetchPresence,
  updatePresence,
  fetchDMUsers,
  uploadFile,
} from "../../utils/api";
import {
  Hash,
  Plus,
  Send,
  Paperclip,
  Users,
  Search,
  X,
  MessageSquare,
  Loader2,
  File,
  Image,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function Chat() {
  const { user, loading: userLoading } = useUser();
  const { addToast } = useToast();

  // State
  const [channels, setChannels] = useState([]);
  const [dmUsers, setDmUsers] = useState([]);
  const [presence, setPresence] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeDM, setActiveDM] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadData();
      // Update presence to online on load
      updatePresence(user.id, "online", null).catch(console.error);
      // Poll for updates every 5 seconds
      const interval = setInterval(() => {
        loadPresence();
        if (activeChannel) loadChannelMessages(activeChannel.id);
        if (activeDM) loadDMMessages(activeDM.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Update presence when switching channels
  useEffect(() => {
    if (user?.id) {
      updatePresence(user.id, "online", activeChannel?.id || null).catch(console.error);
    }
  }, [activeChannel, user?.id]);

  // Load messages when channel/DM changes
  useEffect(() => {
    if (activeChannel) {
      loadChannelMessages(activeChannel.id);
    } else if (activeDM) {
      loadDMMessages(activeDM.id);
    }
  }, [activeChannel?.id, activeDM?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [channelsData, presenceData, dmUsersData] = await Promise.all([
        fetchChannels(),
        fetchPresence(),
        fetchDMUsers(user.id),
      ]);
      console.log("DM Users loaded:", dmUsersData);
      setChannels(channelsData);
      setPresence(presenceData);
      setDmUsers(dmUsersData);

      // Auto-select first channel
      if (channelsData.length > 0 && !activeChannel && !activeDM) {
        setActiveChannel(channelsData[0]);
      }
    } catch (err) {
      console.error("Error loading chat data:", err);
      addToast("Failed to load chat", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPresence = async () => {
    try {
      const data = await fetchPresence();
      setPresence(data);
    } catch (err) {
      console.error("Error loading presence:", err);
    }
  };

  const loadChannelMessages = async (channelId) => {
    try {
      const data = await fetchChannelMessages(channelId);
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const loadDMMessages = async (dmUserId) => {
    try {
      console.log("Loading DM messages for user:", dmUserId, "from:", user.id);
      const data = await fetchDMMessages(dmUserId, user.id);
      console.log("DM messages loaded:", data);
      setMessages(data);
    } catch (err) {
      console.error("Error loading DM:", err);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      const channel = await createChannel(newChannelName, "", user.id);
      setChannels([...channels, channel]);
      setShowCreateChannel(false);
      setNewChannelName("");
      setActiveChannel(channel);
      addToast(`Channel #${channel.name} created`, "success");
    } catch (err) {
      addToast(err.message || "Failed to create channel", "error");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    if (!activeChannel && !activeDM) {
      addToast("Select a channel or DM first", "error");
      return;
    }

    console.log("Sending message:", {
      content: newMessage,
      channel_id: activeChannel?.id,
      recipient_id: activeDM?.id,
      user_id: user.id,
      user_name: user.name
    });

    try {
      setSending(true);
      
      let fileUrl = null;
      let fileName = null;
      
      // Upload file if selected
      if (selectedFile) {
        setUploading(true);
        try {
          const uploadResult = await uploadFile(selectedFile);
          fileUrl = uploadResult.file_url;
          fileName = uploadResult.file_name;
          console.log("File uploaded:", uploadResult);
        } catch (uploadErr) {
          console.error("File upload failed:", uploadErr);
          addToast("File upload failed. Sending message without file.", "error");
        } finally {
          setUploading(false);
        }
      }
      
      const message = await sendMessage(
        newMessage || (fileUrl ? "Sent a file" : ""),
        activeChannel?.id || null,
        activeDM?.id || null,
        user.id,
        fileUrl,
        fileName
      );
      console.log("Message sent:", message);
      setMessages([...messages, message]);
      setNewMessage("");
      setSelectedFile(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to send:", err);
      addToast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
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

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDMUsers = dmUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineUsers = presence.filter((u) => u.status === "online");
  const offlineUsers = presence.filter((u) => u.status !== "online");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
          />
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Sidebar - Channels & DMs */}
        <div className="w-64 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          {/* Channels */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Channels</span>
              <button
                onClick={() => setShowCreateChannel(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => {
                  setActiveChannel(channel);
                  setActiveDM(null);
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm ${
                  activeChannel?.id === channel.id
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Hash className="w-4 h-4" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}

            {/* Create Channel Form */}
            {showCreateChannel && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <input
                  type="text"
                  placeholder="Channel name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateChannel}
                    className="flex-1 px-2 py-1 bg-primary text-white text-xs rounded"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateChannel(false);
                      setNewChannelName("");
                    }}
                    className="px-2 py-1 text-xs text-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Messages */}
          <div className="p-3 flex-1 overflow-y-auto">
            <span className="text-xs font-semibold text-gray-500 uppercase">Direct Messages</span>
            {filteredDMUsers.length === 0 ? (
              <p className="text-xs text-gray-400 mt-2">No users available</p>
            ) : (
              filteredDMUsers.map((dmUser) => (
                <button
                  key={dmUser.id}
                  onClick={() => {
                    console.log("Setting active DM:", dmUser);
                    setActiveDM(dmUser);
                    setActiveChannel(null);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm mt-1 cursor-pointer ${
                    activeDM?.id === dmUser.id
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {getInitials(dmUser.name)}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white ${
                        dmUser.status === "online" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <span className="truncate">{dmUser.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Center - Chat Window */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            {activeChannel ? (
              <>
                <Hash className="w-5 h-5 text-gray-400" />
                <span className="font-semibold">{activeChannel.name}</span>
              </>
            ) : activeDM ? (
              <>
                <div className="relative">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                    {getInitials(activeDM.name)}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white ${
                      activeDM.status === "online" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <span className="font-semibold">{activeDM.name}</span>
                <span className="text-xs text-gray-500">({activeDM.role})</span>
              </>
            ) : (
              <span className="text-gray-500">Select a channel or DM</span>
            )}
            <span className="ml-auto text-xs text-gray-400">
              Logged in as <span className="font-medium text-primary">{user?.name}</span>
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeChannel || activeDM ? (
              messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-semibold flex-shrink-0">
                      {getInitials(msg.sender_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">{msg.sender_name}</span>
                        <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{msg.content}</p>
                      {msg.file_url && (
                        <a
                          href={msg.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          📎 {msg.file_name || "Attachment"}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No messages yet</p>
              )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="w-12 h-12 mb-2" />
                  <p>{activeDM ? `No messages with ${activeDM.name} yet` : "Select a channel or start a DM"}</p>
                  {activeDM && <p className="text-xs mt-2">Send a message to start the conversation!</p>}
                </div>
              )}
          </div>

          {/* Message Input */}
          {activeChannel || activeDM ? (
            <div className="p-3 border-t border-gray-100">
              {/* Selected File Preview */}
              {selectedFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                  {selectedFile.type.startsWith("image/") ? (
                    <Image className="w-4 h-4 text-gray-500" />
                  ) : (
                    <File className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700 flex-1 truncate">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-100 rounded text-gray-500"
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={`Message ${activeChannel ? "#" + activeChannel.name : activeDM?.name}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Sidebar - Members */}
        <div className="w-56 flex-shrink-0 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-sm">Team Members</span>
          </div>
          <div className="p-3 overflow-y-auto">
            {/* Online */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-green-600 uppercase">
                Online ({onlineUsers.length})
              </span>
              {onlineUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-2 py-1.5">
                  <div className="relative">
                    <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-xs text-green-700 font-medium">
                      {getInitials(u.name)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Offline */}
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase">
                Offline ({offlineUsers.length})
              </span>
              {offlineUsers.slice(0, 10).map((u) => (
                <div key={u.id} className="flex items-center gap-2 py-1.5 opacity-60">
                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500">
                    {getInitials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.role}</p>
                  </div>
                </div>
              ))}
              {offlineUsers.length > 10 && (
                <p className="text-xs text-gray-400 pl-9">+{offlineUsers.length - 10} more</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
