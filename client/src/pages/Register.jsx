import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { registerAccount, validateInvitation, registerWithInvitation } from '../utils/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [mode, setMode] = useState('validating');
  const [invitation, setInvitation] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    status: '',
    cycle_input: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const statusOptions = [
    { value: 'intern', label: 'Intern' },
    { value: 'resident', label: 'Resident' },
    { value: 'alumni', label: 'Alumni' },
  ];

  useEffect(() => {
    if (!token) {
      setMode('normal');
      return;
    }
    validateInvitation(token)
      .then(data => {
        if (data.valid) {
          setInvitation(data);
          setForm(f => ({ ...f, email: data.email || '', status: data.intended_role || '' }));
          setMode('special');
        } else {
          setMode('invalid');
        }
      })
      .catch(() => setMode('invalid'));
  }, [token]);

  const formatCycle = (value) => {
    const raw = value.trim().toUpperCase();
    if (!raw) return '';
    if (raw.startsWith('C-')) return raw;
    if (/^\d+$/.test(raw)) return `C-${raw}`;
    if (/^C\d+$/.test(raw)) return `C-${raw.slice(1)}`;
    return raw;
  };

  const handleCycleChange = (e) => {
    const formatted = formatCycle(e.target.value);
    setForm(f => ({ ...f, cycle_input: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.password) {
      setError('All fields are required.');
      return;
    }

    if (mode === 'normal') {
      if (!isAllowedEmail(form.email)) {
        setError('Registration requires an @icstars.org email address.');
        return;
      }
      if (!form.status) {
        setError('Please select your status.');
        return;
      }
      if (form.status === 'intern' && !form.cycle_input) {
        setError('Interns must enter their cycle number.');
        return;
      }
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'special' && token) {
        await registerWithInvitation(token, form.name, form.password);
      } else {
        await registerAccount({
          name: form.name,
          email: form.email,
          password: form.password,
          status: form.status,
          cycle_input: form.cycle_input,
        });
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const isSpecial = invitation?.is_special_invite;
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isSpecial ? 'Account Created!' : 'Check Your Email'}
          </h2>
          <p className="text-text-secondary mb-4">
            {isSpecial ? (
              <>
                Your account is ready. You can log in immediately.
              </>
            ) : (
              <>
                We sent a verification link to <strong>{form.email}</strong>.
                You'll be able to log in once you verify.
              </>
            )}
          </p>
          {!isSpecial && (
            <button
              onClick={() => resendVerificationEmail(form.email)}
              className="btn btn-outline text-sm"
            >
              Resend verification email
            </button>
          )}
          <div className="mt-4">
            <a href="/login" className="text-sm text-primary hover:underline">
              {isSpecial ? 'Log In Now' : 'Back to login'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'invalid') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Invalid or Expired Link</h2>
          <p className="text-text-secondary mb-4">
            This invitation link is invalid or has expired.
          </p>
          <a href="/register" className="btn btn-primary">Go to Registration</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl font-black text-[#b9123f] tracking-tighter">*iCAA</div>
          <h1 className="text-xl font-bold text-neutral-dark mt-1">Join the Community</h1>
          <p className="text-sm text-text-secondary mt-1">
            For i.c.stars program members only
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="input w-full"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
              required
            />
          </div>

          {mode === 'normal' && (
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="input w-full"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@icstars.org"
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                Requires an @icstars.org email address.
              </p>
            </div>
          )}

          {mode === 'normal' && (
            <div>
              <label className="block text-sm font-medium mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-3">
                {statusOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: opt.value }))}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                      form.status === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Cycle {mode === 'normal' && form.status === 'intern' ? '(required)' : '(optional)'}
            </label>
            <input
              type="text"
              className="input w-full"
              value={form.cycle_input}
              onChange={handleCycleChange}
              placeholder="e.g. 58 or C-58"
            />
            <p className="text-xs text-text-secondary mt-1">
              Your ic.stars cycle. Will be formatted as C-XX.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="input w-full"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="input w-full"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter password"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Create My Account'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline">Log in</a>
        </p>

        {mode === 'normal' && (
          <p className="text-center text-xs text-text-secondary mt-4">
            Lost access to your @icstars.org email?{' '}
            <a href="/login" className="text-primary hover:underline">Contact an iCAA administrator</a>
          </p>
        )}
      </div>
    </div>
  );
}

function isAllowedEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;
  return parts[1] === 'icstars.org';
}
