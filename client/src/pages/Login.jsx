import { useEffect, useState } from "react";
import { fetchUsers } from "../utils/api";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleContinue = () => {
    const user = users.find((u) => u.id === Number(selected));
    if (!user) return;

    login(user);
    navigate("/");
  };

  if (loading) {
    return (
      <p className="text-sm text-gray-500 text-center py-12">
        Loading users...
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white border rounded-lg p-6">
      <h1 className="text-xl font-semibold text-gray-900">
        Select a user
      </h1>
      <p className="text-sm text-gray-600 mt-1">
        Choose who you want to act as.
      </p>

      <select
        className="mt-4 w-full border rounded px-3 py-2 text-sm"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Select a user...</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>

      <button
        onClick={handleContinue}
        disabled={!selected}
        className="mt-4 w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
