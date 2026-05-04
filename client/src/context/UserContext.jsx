import { createContext, useContext, useEffect, useState } from "react";
import { updatePresence } from "../utils/api";

const UserContext = createContext(null);

function normalizeUser(rawUser) {
  if (!rawUser) return rawUser;

  const role = rawUser.role || "intern";
  const isCommunityRole = ["mentor", "resident", "alumni", "admin"].includes(
    role,
  );

  return {
    ...rawUser,
    role,
    is_admin: !!rawUser.is_admin,
    has_commenced: isCommunityRole ? (rawUser.has_commenced ?? true) : false,
    cycle: rawUser.cycle ?? null,
  };
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("syncup_user");
    if (stored) {
      try {
        setUser(normalizeUser(JSON.parse(stored)));
      } catch {
        localStorage.removeItem("syncup_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (user) => {
    const normalized = normalizeUser(user);
    localStorage.setItem("syncup_user", JSON.stringify(normalized));
    setUser(normalized);
  };

  const updateUser = (updates) => {
    if (!user) return;
    const updated = normalizeUser({ ...user, ...updates });
    localStorage.setItem("syncup_user", JSON.stringify(updated));
    setUser(updated);
  };

  const logout = async () => {
    if (user?.id) {
      await updatePresence(user.id, "offline", null).catch(console.error);
    }
    localStorage.removeItem("syncup_user");
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
