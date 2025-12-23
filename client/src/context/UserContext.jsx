import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUsers } from "../utils/api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const all = await fetchUsers();
        // Select user 3 (Bonny) for demo purposes since they have data
        const bonny = all.find(u => u.id === 3);
        setUser(bonny || all[0] || null);
      } catch (err) {
        console.error("Failed to load user", err);
        setError("Unable to load user");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
