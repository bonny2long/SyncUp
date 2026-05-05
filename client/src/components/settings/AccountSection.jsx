import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { AlertTriangle, CalendarDays, KeyRound, ShieldCheck, Trash2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function AccountSection() {
  const { user, logout } = useUser();
  const { addToast } = useToast();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      addToast({ type: "success", message: "Password changed successfully." });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      addToast({ type: "success", message: "Account deleted successfully" });
      logout();
    } catch {
      addToast({ type: "error", message: "Failed to delete account" });
    }
  };

  return (
    <div className="brand-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-primary">Security</p>
          <h3 className="text-lg font-black text-neutral-dark dark:text-white">
            Account & Security
          </h3>
          <p className="text-sm text-text-secondary">
            Manage account access and high-impact actions.
          </p>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-highlight/50 p-4 dark:bg-gray-800">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-neutral-dark dark:text-gray-300">
                Password
              </h4>
              <p className="text-xs text-text-secondary">Last changed: Never</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            Change Password
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface-highlight/50 p-4 dark:bg-gray-800">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-neutral-dark dark:text-gray-300">
                Account Information
              </h4>
              <p className="text-xs text-text-secondary">Membership and access status</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              Account created{" "}
              <span className="font-semibold text-neutral-dark dark:text-gray-300">
                {user?.join_date
                  ? new Date(user.join_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </p>
            <p>
              Last login{" "}
              <span className="font-semibold text-neutral-dark dark:text-gray-300">Today</span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20 md:col-span-2">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-red-700 dark:text-red-400">
                Danger Zone
              </h4>
              <p className="text-xs text-red-700/70 dark:text-red-300/70">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            <Trash2 className="h-4 w-4" />
            Delete My Account
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="brand-card w-full max-w-md p-6 dark:bg-surface-highlight">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-neutral-dark dark:text-white">
                Change Password
              </h3>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-neutral-dark dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="input bg-white dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-neutral-dark dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="input bg-white dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-neutral-dark dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="input bg-white dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              {passwordError && <p className="text-sm font-semibold text-red-500">{passwordError}</p>}
              {passwordSuccess && (
                <p className="text-sm font-semibold text-primary">Password changed successfully.</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-neutral-dark transition-colors hover:bg-neutralLight dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="brand-card w-full max-w-md p-6 dark:bg-surface-highlight">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-neutral-dark dark:text-white">
                Delete Account
              </h3>
            </div>
            <p className="mb-6 text-sm text-text-secondary">
              Are you sure you want to delete your account? This action cannot be undone and all
              your data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-neutral-dark transition-colors hover:bg-neutralLight dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
