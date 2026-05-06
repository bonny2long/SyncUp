import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  loginAccount,
  fetchUsers,
  resendVerificationEmail,
} from "../utils/api";
import { useUser } from "../context/UserContext";
import BrandMark from "../components/brand/BrandMark";
import ChicagoAccent from "../components/brand/ChicagoAccent";
import chicagoAccentImages from "../components/brand/chicagoAccentImages";
import usePreloadedImage from "../hooks/usePreloadedImage";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const heroReady = usePreloadedImage(chicagoAccentImages.skylineViewAuth, {
    desktopOnly: true,
  });

  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem("devMode") === "true" || false;
  });
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [devError, setDevError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const registerHero = new Image();
    registerHero.src = chicagoAccentImages.groupPhotoAuth;
  }, []);

  useEffect(() => {
    if (devMode) {
      setLoadingUsers(true);
      fetchUsers()
        .then((data) => {
          setUsers(
            data.sort((a, b) => {
              if (a.role === "admin" && b.role !== "admin") return -1;
              if (a.role !== "admin" && b.role === "admin") return 1;
              return a.name.localeCompare(b.name);
            }),
          );
        })
        .catch(() => setDevError("Failed to load users"))
        .finally(() => setLoadingUsers(false));
    }
  }, [devMode]);

  const handleDevLogin = () => {
    const selected = users.find((u) => u.id === parseInt(selectedUserId, 10));
    if (selected) {
      login(selected);
      navigate("/");
    }
  };

  const handleRealLogin = async (e) => {
    e.preventDefault();
    setError("");
    setShowResend(false);
    setLoading(true);

    try {
      const data = await loginAccount(email, password);
      login(data.user);
      navigate("/");
    } catch (err) {
      const msg = err.message || "Login failed";
      setError(msg);
      if (msg.includes("EMAIL_NOT_VERIFIED")) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationEmail(email);
      setError("");
      setShowResend(false);
      alert("Verification email resent. Check your inbox.");
    } catch {
      // Ignore resend errors here; login remains available.
    }
  };

  if (!heroReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface text-neutral-dark">
        <div className="text-center">
          <BrandMark size="sm" subtitle="Preparing SyncUp" />
          <div className="mx-auto mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-surface-highlight">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh animate-fade-in bg-surface text-neutral-dark lg:grid lg:h-dvh lg:grid-cols-[minmax(420px,0.48fr)_minmax(0,0.52fr)] lg:overflow-hidden">
      <main className="flex min-h-dvh items-center justify-center px-6 py-8 sm:px-10 lg:h-dvh lg:min-h-0 lg:py-6">
        <div className="w-full max-w-md">
          <BrandMark
            size="sm"
            subtitle={
              devMode ?
                "Dev Mode - quick user selection"
              : "For alumni, residents, and interns building the iCAA community."
            }
          />

          <div className="mt-7">
            <h1 className="text-3xl font-black text-neutral-dark">
              Welcome back.
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Sign in to return to SyncChat, projects, mentorship, and the
              community work already in motion.
            </p>
          </div>

          <div className="my-5 flex items-center justify-between rounded-xl border border-border bg-surface-highlight px-4 py-3">
            <span className="text-sm font-semibold">Dev Mode</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={devMode}
                onChange={(e) => {
                  setDevMode(e.target.checked);
                  localStorage.setItem("devMode", e.target.checked);
                }}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
            </label>
          </div>

          {devMode ?
            <div className="space-y-4">
              {devError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {devError}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Select User
                </label>
                <select
                  className="input w-full"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={loadingUsers}
                >
                  <option value="">-- Choose a user --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}
                      {u.cycle ? ` - ${u.cycle}` : ""})
                    </option>
                  ))}
                </select>
                {loadingUsers && (
                  <p className="mt-1 text-xs text-text-secondary">
                    Loading users...
                  </p>
                )}
              </div>

              <button
                onClick={handleDevLogin}
                disabled={!selectedUserId}
                className="btn btn-primary w-full"
              >
                Continue as Selected User
              </button>

              <button
                onClick={() => {
                  throw new Error("Test error from Login page");
                }}
                className="btn btn-ghost w-full text-xs"
              >
                Trigger Test Error
              </button>
            </div>
          : <div>
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                  {showResend && (
                    <button
                      onClick={handleResend}
                      className="mt-1 block text-sm text-primary hover:underline"
                    >
                      Resend verification email
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleRealLogin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@icstars.org"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    className="input w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>

              <div className="mt-5 space-y-2 text-center">
                <p className="text-sm text-text-secondary">
                  <a
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Forgot your password?
                  </a>
                </p>
                <p className="text-sm text-text-secondary">
                  New to SyncUp?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-primary hover:underline"
                  >
                    Create your community account
                  </Link>
                </p>
              </div>
            </div>
          }
        </div>
      </main>

      <aside className="relative hidden h-dvh overflow-hidden bg-accent lg:block">
        <ChicagoAccent
          image="skylineViewAuth"
          variant="panel"
          className="absolute inset-0 border-0 shadow-none"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/80 via-primary/35 to-accent/90" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <div>
            <p className="text-sm font-semibold uppercase text-white/75">
              iCAA HQ
            </p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">
              Chicago-born, community-led, and built for the people who keep
              showing up after the program.
            </p>
          </div>
          <div className="max-w-xl">
            <h2 className="text-4xl font-black leading-none xl:text-5xl">
              Connect. Build. Return stronger.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/80">
              SyncUp carries the iCAA network into daily work: mentorship,
              projects, opportunities, and community presence.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
