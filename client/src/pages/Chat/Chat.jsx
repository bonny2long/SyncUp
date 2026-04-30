import React, { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Hash, Send, Paperclip, Users, Loader2, File, Image, X } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import {
  fetchChannels,
  fetchChannelMessages,
  fetchDMMessages,
  sendMessage,
  fetchPresence,
  updatePresence,
  fetchDMUsers,
  uploadFile,
  getAvatarUrl,
} from "../../utils/api";
import RoleBadge from "../../components/shared/RoleBadge";
import CommunityFeed from "./CommunityFeed";

export default function Chat() {
  const { user } = useUser();
  const { addToast } = useToast();
  const [channels, setChannels] = useState([]);
  const [dmUsers, setDmUsers] = useState([]);
  const [presence, setPresence] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [activeDM, setActiveDM] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const loadPresence = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await fetchPresence(user.id);
      setPresence(data);
    } catch (err) {
      console.error("Error loading presence:", err);
    }
  }, [user?.id]);

  const loadChannelMessages = useCallback(async (channelId) => {
    if (!channelId) return;

    try {
      const data = await fetchChannelMessages(channelId);
      setMessages(data);
    } catch (err) {
      console.error("Error loading channel messages:", err);
    }
  }, []);

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
      const [channelsData, presenceData, dmUsersData] = await Promise.all([
        fetchChannels(user.id),
        fetchPresence(user.id),
        fetchDMUsers(user.id),
      ]);

      setChannels(channelsData);
      setPresence(presenceData);
      setDmUsers(dmUsersData);
      setActiveChannel((prev) => prev || channelsData[0] || null);
    } catch (err) {
      console.error("Error loading chat data:", err);
      addToast("Failed to load chat", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setChannels([]);
      setDmUsers([]);
      setPresence([]);
      setMessages([]);
      setActiveChannel(null);
      setActiveDM(null);
      return;
    }

    loadData();
    updatePresence(user.id, "online", null).catch(console.error);
  }, [loadData, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      loadPresence();
      if (activeChannel?.id) {
        loadChannelMessages(activeChannel.id);
      } else if (activeDM?.id) {
        loadDMMessages(activeDM.id);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [
    activeChannel?.id,
    activeDM?.id,
    loadChannelMessages,
    loadDMMessages,
    loadPresence,
    user?.id,
  ]);

  useEffect(() => {
    if (!user?.id) return;

    updatePresence(user.id, "online", activeChannel?.id || null).catch(
      console.error,
    );
  }, [activeChannel?.id, user?.id]);

  useEffect(() => {
    if (activeChannel?.id) {
      loadChannelMessages(activeChannel.id);
      return;
    }

    if (activeDM?.id) {
      loadDMMessages(activeDM.id);
      return;
    }

    setMessages([]);
  }, [
    activeChannel?.id,
    activeDM?.id,
    loadChannelMessages,
    loadDMMessages,
  ]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;
    if (!activeChannel && !activeDM) {
      addToast("Select a channel or DM first", "error");
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
      if (!messageContent) {
        return;
      }

      const message = await sendMessage(
        messageContent,
        activeChannel?.id || null,
        activeDM?.id || null,
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
  const communityPresence = presence.filter((member) => member.id !== user?.id);
  const onlineMembers = communityPresence.filter((member) => member.status === "online");
  const offlineMembers = communityPresence.filter((member) => member.status !== "online");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="w-72 flex-shrink-0 bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border">
            <span className="text-xs font-semibold text-gray-500 uppercase">
              Channels
            </span>
            <div className="mt-2 space-y-1">
              {channels.length === 0 ?
                <p className="text-xs text-text-secondary">
                  No channels available.
                </p>
              : channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannel(channel);
                      setActiveDM(null);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded text-left text-sm transition-colors ${
                      activeChannel?.id === channel.id ?
                        "bg-primary/10 text-primary"
                      : "text-neutral-dark hover:bg-surface-highlight"
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span className="truncate">#{channel.name}</span>
                  </button>
                ))
              }
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            <span className="text-xs font-semibold text-text-secondary uppercase">
              Direct Messages
            </span>
            <div className="mt-2 space-y-1">
              {dmUsers.length === 0 ?
                <p className="text-xs text-text-secondary">No users available.</p>
              : dmUsers.map((dmUser) => (
                  <button
                    key={dmUser.id}
                    onClick={() => {
                      setActiveDM(dmUser);
                      setActiveChannel(null);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded text-left text-sm transition-colors ${
                      activeDM?.id === dmUser.id ?
                        "bg-primary/10 text-primary"
                      : "text-neutral-dark hover:bg-surface-highlight"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <UserAvatar user={dmUser} size="sm" />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          dmUser.status === "online" ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="truncate font-medium">{dmUser.name}</span>
                        <RoleBadge role={dmUser.role} size="xs" />
                      </div>
                      {dmUser.cycle && (
                        <p className="text-xs text-text-secondary truncate">
                          {dmUser.role === "intern" ?
                            dmUser.cycle
                          : `Commenced ${dmUser.cycle}`}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              }
            </div>
          </div>
        </div>

        <div className="flex-1 bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            {activeChannel ?
              <>
                <Hash className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-neutral-dark">
                  {activeChannel.name}
                </span>
              </>
            : selectedDM ?
              <>
                <div className="relative">
                  <UserAvatar user={selectedDM} size="sm" />
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      selectedDM.status === "online" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-neutral-dark">
                    {selectedDM.name}
                  </span>
                  <RoleBadge role={selectedDM.role} size="xs" />
                  {selectedDM.cycle && (
                    <span className="text-xs text-text-secondary">
                      {selectedDM.role === "intern" ?
                        selectedDM.cycle
                      : `Commenced ${selectedDM.cycle}`}
                    </span>
                  )}
                </div>
              </>
            : <span className="text-text-secondary">Select a channel or DM</span>}
            <span className="ml-auto text-xs text-text-secondary">
              Logged in as{" "}
              <span className="font-medium text-primary">{user?.name}</span>
            </span>
          </div>

          <CommunityFeed />

          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            aria-label="Messages"
            role="log"
            aria-live="polite"
          >
            {activeChannel || selectedDM ?
              messages.length > 0 ?
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
                        className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-baseline gap-2 mb-1">
                          {!isMe && (
                            <span className="font-semibold text-xs text-neutral-dark">
                              {message.sender_name}
                            </span>
                          )}
                          <span className="text-xs text-text-secondary">
                            {formatTime(message.created_at)}
                          </span>
                        </div>

                        <div
                          className={`px-4 py-2 rounded-2xl shadow-sm text-sm ${
                            isMe ?
                              "bg-primary text-white rounded-br-none"
                            : "bg-surface-highlight text-neutral-dark rounded-bl-none border border-border"
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
                              className={`block mt-2 text-xs hover:underline flex items-center gap-1 ${
                                isMe ? "text-blue-100" : "text-primary"
                              }`}
                            >
                              <Paperclip className="w-3 h-3" />
                              {message.file_name || "Attachment"}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              : <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                  <MessageSquare className="w-12 h-12 mb-2" />
                  <p>
                    {selectedDM ?
                      `No messages with ${selectedDM.name} yet`
                    : "No messages yet"}
                  </p>
                </div>
            : <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p>Select a channel or start a DM</p>
              </div>}
          </div>

          {(activeChannel || selectedDM) && (
            <div className="p-3 border-t border-border">
              {selectedFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-surface-highlight rounded-lg border border-border">
                  {selectedFile.type.startsWith("image/") ?
                    <Image className="w-4 h-4 text-gray-500" />
                  : <File className="w-4 h-4 text-gray-500" />}
                  <span className="text-sm text-neutral-dark flex-1 truncate">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={clearSelectedFile}
                    className="p-1 hover:bg-surface rounded"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-text-secondary" />
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
                  className="p-2 hover:bg-surface-highlight rounded text-text-secondary"
                  disabled={uploading}
                  aria-label="Attach file"
                >
                  {uploading ?
                    <Loader2 className="w-5 h-5 animate-spin" />
                  : <Paperclip className="w-5 h-5" />}
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
                  placeholder={`Message ${activeChannel ? `#${activeChannel.name}` : selectedDM?.name}`}
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-surface-highlight text-neutral-dark placeholder-text-secondary"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || sending}
                  className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-56 flex-shrink-0 bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <Users className="w-4 h-4 text-text-secondary" />
            <span className="font-semibold text-sm text-neutral-dark">
              Online Now
            </span>
            <span className="ml-auto text-xs text-text-secondary">
              {onlineMembers.length}
            </span>
          </div>

          <div className="p-2 overflow-y-auto flex-1">
            {onlineMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  setActiveDM(member);
                  setActiveChannel(null);
                }}
                className="w-full flex items-center gap-2 p-2 hover:bg-surface-highlight rounded-lg text-left transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <UserAvatar user={member} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark truncate">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-1">
                    <RoleBadge role={member.role} size="xs" />
                    {member.cycle && (
                      <span className="text-xs text-text-secondary">
                        {member.cycle}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {onlineMembers.length === 0 && offlineMembers.length === 0 && (
              <p className="p-2 text-xs text-text-secondary">
                No community members available yet.
              </p>
            )}

            {offlineMembers.length > 0 && onlineMembers.length > 0 && (
              <div className="my-2 border-t border-border" />
            )}

            {offlineMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  setActiveDM(member);
                  setActiveChannel(null);
                }}
                className="w-full flex items-center gap-2 p-2 hover:bg-surface-highlight rounded-lg text-left transition-colors opacity-60"
              >
                <div className="relative flex-shrink-0">
                  <UserAvatar user={member} size="sm" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark truncate">
                    {member.name}
                  </p>
                  <RoleBadge role={member.role} size="xs" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
