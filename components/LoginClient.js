"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [form, setForm] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const username = form.username.trim();
    const password = form.password;

    if (!username) return "Username is required.";
    if (username.length < 3) return "Username must be at least 3 characters.";
    if (!password) return "Password is required.";
    if (password.length < 4) return "Password must be at least 4 characters.";

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          rememberMe: form.rememberMe,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Unable to login right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1
            className="text-3xl font-bold text-stone-800"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Admin Login
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Sign in to access the sewa manager.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* username */}
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Username
            </label>
            <input
              type="text"
              className="input-field"
              value={form.username}
              onChange={(e) =>
                setForm((c) => ({ ...c, username: e.target.value }))
              }
            />
          </div>

          {/* password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field pr-11"
                value={form.password}
                onChange={(e) =>
                  setForm((c) => ({ ...c, password: e.target.value }))
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((c) => !c)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* remember */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.rememberMe}
              onChange={(e) =>
                setForm((c) => ({ ...c, rememberMe: e.target.checked }))
              }
            />
            Remember me
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Login"}
          </button>
          <h1>Demo Credentials</h1>
          <p>Username:admin</p>
          <p>password:admin123</p>
        </form>
      </div>
    </div>
  );
}