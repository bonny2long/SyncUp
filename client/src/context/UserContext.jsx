import { createContext, useContext, useEffect, useState } from "react";
import { updatePresence } from "../utils/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
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

  const updateUser = (updates) => {
    if (!user) return;
    const updated = { ...user, ...updates };
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
