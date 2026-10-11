
import { useEffect, useState, type FormEvent } from 'react';
import type { UserProfile } from '../types';
import {
  apiService,
  getApiErrorMessage,
  getAuthToken,
  getAuthUser,
  setAuthSession,
} from '../services/api';

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await apiService.getProfile();

        if (active) {
          setProfile(data);
          setName(data.name);
        }
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err, 'Unable to load your profile.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }

    setSavingProfile(true);

    try {
      const updatedProfile = await apiService.updateProfile({
        name: trimmedName,
      });

      setProfile(updatedProfile);
      setName(updatedProfile.name);

      const token = getAuthToken();
      const currentUser = getAuthUser();

      if (token && currentUser) {
        setAuthSession(token, {
          ...currentUser,
          name: updatedProfile.name,
        });
      }

      setSuccessMessage('Your profile was updated successfully.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update your profile.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please complete all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('The new password and confirmation do not match.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Your new password must contain at least one uppercase letter.');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Your new password must contain at least one lowercase letter.');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('Your new password must contain at least one number.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Your new password must be different from your current password.');
      return;
    }

    setChangingPassword(true);

    try {
      const result = await apiService.changePassword(
        currentPassword,
        newPassword
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setSuccessMessage(
        result.message || 'Your password was changed successfully.'
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Unable to change your password. Check your current password and try again.'
        )
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600">Loading your profile...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-[60vh] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Unable to Load Profile
          </h1>
          <p className="mt-3 text-gray-600">
            {error || 'Your profile could not be loaded from the server.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
            Account Settings
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and password.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {successMessage}
          </div>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-800">
              {(profile.name.trim().charAt(0) || '?').toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-gray-900">
                {profile.name}
              </h2>
              <p className="break-all text-sm text-gray-500">
                {profile.email}
              </p>
              {profile.role && (
                <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
                  {profile.role}
                </span>
              )}
            </div>
          </div>

          <div className="mb-6 border-t border-gray-100" />

          <h2 className="text-lg font-bold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your display name. Your registered email cannot be changed here.
          </p>

          <form onSubmit={handleProfileSubmit} className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Full Name
              </span>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Email Address
              </span>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-gray-500"
              />
              <span className="mt-1 block text-xs text-gray-500">
                Email address is read-only.
              </span>
            </label>

            <button
              type="submit"
              disabled={savingProfile || !name.trim()}
              className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-gray-900">
            Change Password
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your new password must contain at least one uppercase letter, one lowercase letter, and one number.
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Current Password
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                New Password
              </span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Confirm New Password
              </span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </label>

            <button
              type="submit"
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ProfilePage;
