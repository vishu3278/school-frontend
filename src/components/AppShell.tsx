"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              JD
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                School Portal
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                JD Modern School
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium text-slate-700">{user.email}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {user.role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] pt-16">
        <aside className="fixed left-0 top-16 flex h-[calc(100vh-4rem)] w-72 flex-col border-r border-slate-200 bg-slate-900 text-slate-100">
          <nav className="flex-1 space-y-1 p-4">
            {hasRole("admin") && (
                <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white">
                  Dashboard
                </Link>
            )}
            {/* <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white">
              Dashboard
            </Link> */}

            {hasRole("admin", "teacher") && (
              <Link href="/students" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white">
                Students
              </Link>
            )}

            {hasRole("admin") && (
              <Link href="/grades" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white">
                Grades
              </Link>
            )}

            {hasRole("admin") && (
              <Link href="/sections" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white">
                Sections
              </Link>
            )}

            {hasRole("admin") && (
              <Link href="/admin/users" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white">
                Users
              </Link>
            )}

            {hasRole("admin") && (
              <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white">
                Admin
              </Link>
            )}
          </nav>

          <div className="border-t border-slate-700 p-4 text-sm text-slate-300">
            {isAuthenticated ? (
              <div>
                <p className="font-medium text-white">{user?.email}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{user?.role}</p>
              </div>
            ) : (
              <p>Sign in to continue</p>
            )}
          </div>
        </aside>

        <main className="ml-72 flex-1 p-6 lg:p-8">
          <div className="min-h-[calc(100dvh-8rem)] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
