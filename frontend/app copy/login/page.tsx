// app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  LogIn,
} from "lucide-react";

type Role = "student" | "teacher" | "admin";

const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
};

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const form = new URLSearchParams();

      form.set("email", email.trim());
      form.set("pass", password);
      form.set("type", role);

      // Only send this if your Go backend supports the "remember" field.
      form.set("remember", remember ? "true" : "false");

      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });

      // Try to read JSON safely.
      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();

        console.error("Login API returned non-JSON:", text);

        setError(
          res.ok
            ? "Unexpected response from the server."
            : `Server error (${res.status}). Please try again.`,
        );

        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid email, password, or role.");
        return;
      }

      // Login successful.
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Could not reach the server. Please make sure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 border-b-2 border-emerald-800/70 pb-4">
          <img
            src="/logo.png"
            alt="Netrokona University crest"
            className="h-10 w-10 object-contain"
          />

          <span className="text-lg font-semibold text-red-800 underline underline-offset-4">
            Netrokona University
          </span>
        </div>

        {/* Title */}
        <div className="mb-6 mt-6">
          <h1 className="text-2xl font-bold leading-snug text-red-800">
            Welcome Back to CSE Portal
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Log in to access your dashboard, classrooms, and schedules.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="mb-1 block text-sm font-medium text-neutral-800"
            >
              Log in as
            </label>

            <div className="relative">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={loading}
                className="w-full appearance-none rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2.5 pr-9 text-sm text-neutral-800 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-neutral-800"
            >
              University Email
            </label>

            <div className="relative">
              <Mail
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@neu.ac.bd"
                disabled={loading}
                className="w-full rounded-md border border-neutral-300 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-800"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <Lock
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full rounded-md border border-neutral-300 bg-neutral-50 py-2.5 pl-9 pr-10 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/30 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={loading}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600 disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 rounded border-neutral-300 text-red-800 focus:ring-red-800/30"
            />

            <span>Remember me for 30 days</span>
          </label>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-red-800 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign In as {ROLE_LABELS[role]}
                <LogIn size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}