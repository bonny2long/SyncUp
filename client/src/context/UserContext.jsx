import { createContext, useContext, useEffect, useState } from "react";
import { updatePresence, fetchUsers } from "../utils/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("syncup_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("syncup_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (user) => {
    localStorage.setItem("syncup_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    if (user?.id) {
      await updatePresence(user.id, "offline", null).catch(console.error);
    }
    localStorage.removeItem("syncup_user");
    setUser(null);
    setOriginalUser(null);
  };

  const impersonate = async (targetUser) => {
    console.log("Starting impersonation for user:", targetUser);
    try {
      const users = await fetchUsers();
      // Use loose equality (==) for ID to handle string vs number mismatches
      const fullUser = users.find((u) => u.id == targetUser.id);

      if (fullUser) {
        console.log("Full user data found:", fullUser);
        setOriginalUser(user);
        setUser(fullUser);
        localStorage.setItem("syncup_user", JSON.stringify(fullUser));
      } else {
        console.warn(
          "Target user not found in fetchUsers list, falling back to provided targetUser",
        );
        setOriginalUser(user);
        setUser(targetUser);
        localStorage.setItem("syncup_user", JSON.stringify(targetUser));
      }
    } catch (err) {
      console.error(
        "Failed to fetch full user data during impersonation:",
        err,
      );
      setOriginalUser(user);
      setUser(targetUser);
      localStorage.setItem("syncup_user", JSON.stringify(targetUser));
    }
  };

  const stopImpersonating = () => {
    if (originalUser) {
      setUser(originalUser);
      localStorage.setItem("syncup_user", JSON.stringify(originalUser));
      setOriginalUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        originalUser,
        login,
        logout,
        impersonate,
        stopImpersonating,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
