import { createContext, useContext, useEffect, useState } from "react";
import { updatePresence } from "../utils/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
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
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
