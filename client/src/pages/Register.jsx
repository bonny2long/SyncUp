import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { validateInvitation, registerWithInvitation } from "../utils/api";

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [validationState, setValidationState] = useState("loading");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidationState("invalid");
      return;
    }

    const checkToken = async () => {
      try {
        const result = await validateInvitation(token);
        if (result.valid) {
          setEmail(result.email);
          setValidationState("valid");
        } else {
          setError(result.error || "Invalid invitation");
          setValidationState("invalid");
        }
      } catch (err) {
        setError("Failed to validate invitation");
        setValidationState("invalid");
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerWithInvitation(token, name, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (validationState === "loading") {
    return (
      <div className="min-h-screen bg-neutralLight flex items-center justify-center">
        <div className="bg-surface p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-neutral-medium">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (validationState === "invalid") {
    return (
      <div className="min-h-screen bg-neutralLight flex items-center justify-center">
        <div className="bg-surface p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">Invalid Invitation</h1>
          <p className="text-neutral-medium mb-6">{error || "This invitation link is invalid or has expired."}</p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutralLight flex items-center justify-center">
        <div className="bg-surface p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">Account Created!</h1>
          <p className="text-neutral-medium mb-6">Your admin account has been created successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutralLight flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-dark">Create Admin Account</h1>
          <p className="text-neutral-medium mt-2">You've been invited to join as an admin</p>
        </div>

        <div className="bg-surface rounded-lg shadow-lg p-6">
          <div className="mb-6 p-3 bg-surface-highlight rounded-lg">
            <p className="text-sm text-neutral-medium">Invited email:</p>
            <p className="font-medium text-neutral-dark">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Admin Account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-medium mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
