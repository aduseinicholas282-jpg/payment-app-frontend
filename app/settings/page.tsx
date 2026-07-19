"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { updateProfile, changePassword, deleteAccount, ApiError } from "@/lib/api";

export default function SettingsPage() {
  const { user, token, loading, signOut, updateUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileBusy, setProfileBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setProfileBusy(true);
    try {
      const updated = await updateProfile(token, name, email);
      updateUser(updated);
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setProfileBusy(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) {
      showToast("New passwords don't match", "error");
      return;
    }
    setPasswordBusy(true);
    try {
      await changePassword(token, currentPassword, newPassword);
      showToast("Password changed", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
    } finally {
      setPasswordBusy(false);
    }
  }

  async function handleDelete() {
    if (!token) return;
    setDeleteBusy(true);
    try {
      await deleteAccount(token);
      signOut();
      router.push("/");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Something went wrong", "error");
      setDeleteBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-ink-soft text-sm">Loading…</p>
      </main>
    );
  }

  if (!user || !token) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-3">
        <p className="text-ink-soft text-sm">Please sign in first.</p>
        <Link href="/" className="text-teal text-sm font-medium hover:underline">
          Back to ledger
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-lg w-full mx-auto px-4 py-12 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Settings</h1>
        <Link href="/" className="text-sm text-ink-soft hover:text-teal transition-colors">
          Back to ledger
        </Link>
      </header>

      <form
        onSubmit={handleProfileSubmit}
        className="glass-card rounded-2xl p-6 space-y-4"
        style={{ "--card-glow": "var(--teal-glow)" } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold text-ink">Profile</h2>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </div>
        <button
          type="submit"
          disabled={profileBusy}
          style={{ "--btn-color": "var(--teal)", "--btn-glow": "var(--teal-glow)" } as React.CSSProperties}
          className="glow-btn rounded-lg px-4 py-2 text-sm font-semibold text-bg disabled:opacity-60"
        >
          {profileBusy ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="glass-card rounded-2xl p-6 space-y-4"
        style={{ "--card-glow": "var(--violet-glow)" } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold text-ink">Change password</h2>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">Current password</label>
          <input
            required
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">New password</label>
          <input
            required
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1">Confirm new password</label>
          <input
            required
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg bg-bg-elevated border border-surface-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet"
          />
        </div>
        <button
          type="submit"
          disabled={passwordBusy}
          style={{ "--btn-color": "var(--violet)", "--btn-glow": "var(--violet-glow)" } as React.CSSProperties}
          className="glow-btn rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {passwordBusy ? "Saving…" : "Change password"}
        </button>
      </form>

      <div
        className="glass-card rounded-2xl p-6 space-y-3 border-error/30"
        style={{ "--card-glow": "var(--error-glow)" } as React.CSSProperties}
      >
        <h2 className="font-display text-lg font-semibold text-error">Danger zone</h2>
        <p className="text-sm text-ink-soft">
          Deleting your account is permanent. Your past transactions are kept
          for records, but you&apos;ll lose access to your account entirely.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm font-medium text-error border border-error/30 rounded-lg px-4 py-2 hover:bg-error/10 transition-colors"
          >
            Delete my account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleteBusy}
              className="text-sm font-medium text-white bg-error rounded-lg px-4 py-2 hover:bg-error/90 transition-colors disabled:opacity-60"
            >
              {deleteBusy ? "Deleting…" : "Yes, delete permanently"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm text-ink-soft hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </main>
  );
}