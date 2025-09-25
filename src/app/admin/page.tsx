"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  role: string;
  points: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and has admin role
    fetch("/api/user/me")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          router.push("/auth/signin");
        }
      })
      .then((data) => {
        if (data?.user) {
          if (data.user.role !== 'admin') {
            router.push("/dashboard");
            return;
          }
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/auth/signin");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const downloadBios = () => {
    window.open("/api/admin/bios", "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage students and system settings</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Student Management</h2>
          <button
            onClick={downloadBios}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download Student Bios
          </button>
        </div>
      </div>
    </div>
  );
}
