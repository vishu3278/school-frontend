"use client";

import Link from "next/link";

import { useAuth } from "@/lib/auth";

export default function Home() {
  const { isAuthenticated, hasRole } = useAuth();

  return (
    <main className="flex min-h-128 justify-center p-8">
      
        <div className="mb-4 flex items-center justify-between gap-3">
          {isAuthenticated ? (
            <div className="">
              {hasRole("student") && (
                <Link
                  href="/students"
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Student Route
                </Link>
              )}
              
              {hasRole("teacher") || hasRole("staff") && (
                <Link
                  href="/user"
                  className="rounded bg-gray-200 px-4 py-2 text-gray-800"
                >
                  User info page
                </Link>
              )}
            
            {hasRole("admin") && (
              <>
                <h2 className="mb-6 text-xl text-gray-600">
                  Manage students, grades, and academic records from a single
                  dashboard.
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <Link
                    href="/admin/users"
                    className="rounded border bg-white p-4 shadow-sm transition hover:border-blue-300"
                    >
                    <h2 className="mb-2 font-semibold">Users</h2>
                    <p className="text-gray-600">
                      Manage staff, teachers, students, and admins.
                    </p>
                  </Link>
    
                  <div className="rounded border bg-white p-4 shadow-sm">
                    <h2 className="mb-2 font-semibold">Academic Records</h2>
                    <p className="text-gray-600">
                      Review grades and student performance.
                    </p>
                  </div>
    
                  <div className="rounded border bg-white p-4 shadow-sm">
                    <h2 className="mb-2 font-semibold">Reporting</h2>
                    <p className="text-gray-600">
                      Monitor compliance and activity across the school.
                    </p>
                  </div>
                </div>
              </>
            )}
            {/* {hasRole("staff") && (
              <div className="text-center space-y-3">
                <p className="text-gray-600">
                  Staff members can see their dashboard and manage assigned tasks.
                </p>
                </div>
            )} */}
            </div>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-gray-600">Login in to access the school management system</p>
            <Link
              href="/login"
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Login
            </Link>
            </div>
          )}
        </div>

        


        
      
    </main>
  );
}
