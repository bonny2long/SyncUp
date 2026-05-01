import React from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

export default function SessionChat({ otherUser }) {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleMessageClick = () => {
    const isCommunityMember = ["alumni", "resident", "mentor"].includes(user?.role);
    const canAccessSyncChat = isCommunityMember || (user?.role === "intern" && user?.has_commenced);

    if (canAccessSyncChat) {
      navigate(`/chat?user=${otherUser.id}`);
    } else {
      navigate(`/lobby?user=${otherUser.id}`);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border flex justify-end">
      <button
        onClick={handleMessageClick}
        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition"
        title={`Message ${otherUser.name}`}
      >
        <MessageCircle className="w-4 h-4" />
        Message {otherUser.role === 'intern' ? 'Intern' : 'Mentor'}
      </button>
    </div>
  );
}
