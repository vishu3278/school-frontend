"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api<{ access_token: string; user: { id: string; email: string; role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(response.access_token, response.user);
      router.push(response.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-[32rem] items-center justify-center ">
      <div className="w-full max-w-md  bg-white ">
        <h1 className="mb-2 text-2xl font-semibold">Login</h1>
        <p className="mb-6 text-gray-600">Sign in to access the school management system</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border p-2"
              required
            />
          </div>

          {error && (
            <div className="rounded bg-red-100 p-3 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
