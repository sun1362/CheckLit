
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService, getApiErrorMessage } from '../services/api';

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Your password must contain at least one uppercase letter.');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Your password must contain at least one lowercase letter.');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Your password must contain at least one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      await apiService.register(trimmedName, trimmedEmail, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create your account.'));
    } finally {
      setLoading(false);
    }
  };

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">
            🛒
          </div>
          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Register to save and manage your shopping lists.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </span>
            <input
              type="text"
              autoComplete="name"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              aria-describedby="password-requirements"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <div
              id="password-requirements"
              className="mt-3 rounded-lg bg-gray-50 p-3"
            >
              <p className="mb-2 text-sm font-medium text-gray-700">
                Password must contain:
              </p>
              <div className="space-y-1.5 text-sm">
                <p className={hasUppercase ? 'text-green-700' : 'text-gray-500'}>
                  {hasUppercase ? '✓' : '○'} At least one uppercase letter (A–Z)
                </p>
                <p className={hasLowercase ? 'text-green-700' : 'text-gray-500'}>
                  {hasLowercase ? '✓' : '○'} At least one lowercase letter (a–z)
                </p>
                <p className={hasNumber ? 'text-green-700' : 'text-gray-500'}>
                  {hasNumber ? '✓' : '○'} At least one number (0–9)
                </p>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Confirm Password
            </span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </label>

          <button
            type="submit"
            disabled={
              loading ||
              !name.trim() ||
              !email.trim() ||
              !hasUppercase ||
              !hasLowercase ||
              !hasNumber ||
              password !== confirmPassword
            }
            className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-green-700 hover:text-green-900"
          >
            Log In
          </Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
