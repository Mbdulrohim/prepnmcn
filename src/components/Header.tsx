"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
  BarChart3,
  Calendar,
  Trophy,
  Home,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const loading = status === "loading";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (loading) {
    return (
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-[#1e40af] hover:text-[#1d4ed8] transition-colors"
            >
              <Image src="/preplogo.png" alt="O/Prep" width={32} height={32} />
              O/Prep
            </Link>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold text-[#1e40af] hover:text-[#1d4ed8] transition-colors"
          >
            <Image src="/preplogo.png" alt="O/Prep" width={32} height={32} />
            O/Prep
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-all duration-200"
                  title="Dashboard"
                >
                  <Home size={20} />
                </Link>
                <Link
                  href="/study-planner"
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-all duration-200"
                  title="Study Planner"
                >
                  <Calendar size={20} />
                </Link>
                <Link
                  href="/leaderboard"
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-all duration-200"
                  title="Leaderboard"
                >
                  <Trophy size={20} />
                </Link>
                <Link
                  href="/forums"
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-all duration-200"
                  title="Forums"
                >
                  <MessageSquare size={20} />
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
                  <div className="w-8 h-8 bg-[#1e40af]/10 rounded-full flex items-center justify-center">
                    <User size={16} className="text-[#1e40af]" />
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <Button asChild className="bg-[#1e40af] hover:bg-[#1d4ed8]">
                <Link href="/auth/signin" className="flex items-center gap-2">
                  <User size={16} />
                  <span>Sign In</span>
                </Link>
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={20} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/study-planner"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar size={20} />
                  <span>Study Planner</span>
                </Link>
                <Link
                  href="/leaderboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Trophy size={20} />
                  <span>Leaderboard</span>
                </Link>
                <Link
                  href="/forums"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-[#1e40af] hover:bg-[#1e40af]/5 transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare size={20} />
                  <span>Forums</span>
                </Link>

                <div className="px-4 py-2 border-t border-gray-100 mt-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 bg-[#1e40af]/10 rounded-full flex items-center justify-center">
                      <User size={16} className="text-[#1e40af]" />
                    </div>
                    <Button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4">
                <Button
                  asChild
                  className="w-full bg-[#1e40af] hover:bg-[#1d4ed8]"
                >
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-2 justify-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>Sign In</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
