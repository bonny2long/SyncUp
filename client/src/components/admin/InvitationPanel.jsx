import { useState, useEffect } from "react";
import { Mail, Copy, Check, X, Clock, UserPlus } from "lucide-react";
import {
  fetchInvitations,
  createInvitation,
  revokeInvitation as apiRevokeInvitation,
} from "../../utils/api";

export default function InvitationPanel() {
  const [email, setEmail] = useState("");
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    try {
      const data = await fetchInvitations();
      setInvitations(data);
    } catch (err) {
      console.error("Failed to fetch invitations:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createInvitation(email);
      setSuccess("Invitation created successfully!");
      setEmail("");
      loadInvitations();
    } catch (err) {
      setError(err.message || "Failed to create invitation");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const revokeInvitation = async (id) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;

    try {
      await apiRevokeInvitation(id);
      loadInvitations();
    } catch (err) {
      setError(err.message || "Failed to revoke invitation");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      used: "bg-green-100 text-green-800",
      expired: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-dark">
            Invite New Admin
          </h3>
          <p className="text-sm text-neutral-medium">
            Send invitation links to new admin users
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
      </form>

      <div>
        <h4 className="text-sm font-medium text-neutral-dark mb-3">
          Recent Invitations
        </h4>
        {invitations.length === 0 ?
          <p className="text-sm text-neutral-medium text-center py-4">
            No invitations yet
          </p>
        : <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 bg-surface-highlight rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark truncate">
                    {inv.email}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-neutral-medium">
                      {formatDate(inv.createdAt)}
                    </span>
                    {getStatusBadge(inv.status)}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {inv.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          copyLink(
                            `${window.location.origin}/register?token=${inv.token}`,
                            inv.id,
                          )
                        }
                        className="p-2 hover:bg-surface rounded-lg transition"
                        title="Copy link"
                        aria-label="Copy invitation link"
                      >
                        {copiedId === inv.id ?
                          <Check className="w-4 h-4 text-green-500" />
                        : <Copy className="w-4 h-4 text-neutral-medium" />}
                      </button>
                      <button
                        onClick={() => revokeInvitation(inv.id)}
                        className="p-2 hover:bg-surface rounded-lg transition"
                        title="Revoke"
                        aria-label="Revoke invitation"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </>
                  )}
                  {inv.status === "used" && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {inv.status === "expired" && (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
