import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8">
      <div className="w-full max-w-3xl rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-black">
          School Management System
        </h1>

        <p className="mb-6 text-gray-600">
          Manage students, grades, and academic records from a single dashboard.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/students"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Student Route
          </Link>

          <Link
            href="/grades"
            className="rounded bg-gray-200 px-4 py-2 text-gray-800"
          >
            Grade Route
          </Link>
        </div>
      </div>
    </main>
  );
}
