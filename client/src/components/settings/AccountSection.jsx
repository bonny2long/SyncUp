import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { AlertTriangle } from "lucide-react";

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
      addToast({ type: "success", message: "Password changed successfully!" });
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
    } catch (err) {
      addToast({ type: "error", message: "Failed to delete account" });
    }
  };

  return (
    <div className="bg-surface dark:bg-surface-highlight rounded-xl border border-border dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-neutral-dark dark:text-white mb-1">
        Account & Security
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Manage your account settings
      </p>

      <div className="space-y-6">
        {/* Password */}
        <div>
          <h4 className="text-sm font-medium text-neutral-dark dark:text-gray-300 mb-2">
            Password
          </h4>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="text-sm text-primary hover:underline font-medium"
          >
            Change Password →
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Last changed: Never
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-neutral-dark dark:text-gray-300 mb-2">
            Account Information
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500 dark:text-gray-400">
              Account created:{" "}
              <span className="text-neutral-dark dark:text-gray-300">
                {user?.join_date
                  ? new Date(user.join_date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Last login:{" "}
              <span className="text-neutral-dark dark:text-gray-300">Today</span>
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-border dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h4>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm"
          >
            Delete My Account
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This action cannot be undone
          </p>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface dark:bg-surface-highlight rounded-xl border border-border dark:border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-dark dark:text-white mb-4">
              Change Password
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full border border-border dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400">Password changed successfully!</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="flex-1 px-4 py-2.5 border border-border dark:border-gray-600 rounded-lg text-sm font-medium text-neutral-dark dark:text-gray-300 hover:bg-neutralLight dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface dark:bg-surface-highlight rounded-xl border border-border dark:border-gray-700 p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-dark dark:text-white">
                Delete Account
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete your account? This action cannot be
              undone and all your data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-border dark:border-gray-600 rounded-lg text-sm font-medium text-neutral-dark dark:text-gray-300 hover:bg-neutralLight dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
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
