import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAccount, fetchUsers } from '../utils/api';
import { useUser } from '../context/UserContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();

  // Dev mode state
  const [devMode, setDevMode] = useState(() => {
    return localStorage.getItem('devMode') === 'true' || false;
  });
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [devError, setDevError] = useState('');

  // Real login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResend, setShowResend] = useState(false);

  // Load users for dev mode
  useEffect(() => {
    if (devMode) {
      setLoadingUsers(true);
      fetchUsers()
        .then(data => {
          setUsers(data.sort((a, b) => {
            if (a.role === 'admin' && b.role !== 'admin') return -1;
            if (a.role !== 'admin' && b.role === 'admin') return 1;
            return a.name.localeCompare(b.name);
          }));
        })
        .catch(() => setDevError('Failed to load users'))
        .finally(() => setLoadingUsers(false));
    }
  }, [devMode]);

  const handleDevLogin = () => {
    const selected = users.find(u => u.id === parseInt(selectedUserId));
    if (selected) {
      login(selected);
      if (selected.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  const handleRealLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowResend(false);
    setLoading(true);

    try {
      const data = await loginAccount(email, password);
      login(data.user);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg);
      if (msg.includes('EMAIL_NOT_VERIFIED')) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerificationEmail(email);
      setError('');
      setShowResend(false);
      alert('Verification email resent. Check your inbox.');
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Log In to SyncUp</h1>
          <p className="text-text-secondary mt-2">
            {devMode ? 'Dev Mode — Quick user selection' : 'Enter your credentials to access your account.'}
          </p>
        </div>

        {/* Dev Mode Toggle */}
        <div className="flex items-center justify-between mb-6 p-3 bg-surface-highlight rounded-lg">
          <span className="text-sm font-medium">Dev Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => {
                setDevMode(e.target.checked);
                localStorage.setItem('devMode', e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Dev Mode Login */}
        {devMode ? (
          <div className="space-y-4">
            {devError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{devError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Select User</label>
              <select
                className="input w-full"
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                disabled={loadingUsers}
              >
                <option value="">-- Choose a user --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}{u.cycle ? ` - ${u.cycle}` : ''})
                  </option>
                ))}
              </select>
              {loadingUsers && <p className="text-xs text-text-secondary mt-1">Loading users...</p>}
            </div>

            <button
              onClick={handleDevLogin}
              disabled={!selectedUserId}
              className="btn btn-primary w-full"
            >
              Continue as Selected User
            </button>

            {/* Debug button */}
            <button
              onClick={() => {
                throw new Error('Test error from Login page');
              }}
              className="btn btn-ghost w-full text-xs"
            >
              Trigger Test Error
            </button>
          </div>
        ) : (
          /* Real Login Form */
          <div>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                {showResend && (
                  <button
                    onClick={handleResend}
                    className="text-sm text-primary hover:underline mt-1 block"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleRealLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input w-full"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@icstars.org"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  className="input w-full"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <div className="text-center mt-4 space-y-2">
              <p className="text-sm text-text-secondary">
                <a href="/forgot-password" className="text-primary hover:underline">Forgot your password?</a>
              </p>
              <p className="text-sm text-text-secondary">
                Don't have an account?{' '}
                <a href="/register" className="text-primary hover:underline">Register</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
