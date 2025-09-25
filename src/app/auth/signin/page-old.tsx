"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SignIn() {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: profile setup
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        // User is already authenticated, redirect to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      // User not authenticated, stay on signin page
    }
  };

  const sendCode = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Verification code sent to your email!");
        setStep(2);
      } else {
        setError(data.error || "Failed to send code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code) {
      setError("Verification code is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.isNewUser) {
          // New user - go to profile setup
          setStep(3);
          setMessage("Code verified! Please complete your profile.");
        } else {
          // Existing user - redirect to dashboard
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "Invalid code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async () => {
    if (!name || !institution) {
      setError("Name and institution are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          institution,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to complete profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">P</span>
              </div>
              <CardTitle className="text-2xl font-bold">
                Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PREPNMCN</span>
              </CardTitle>
              <CardDescription className="text-sm">
                {step === 1
                  ? "Enter your email to receive a verification code"
                  : step === 2
                  ? "Enter the 6-digit code sent to your email"
                  : "Complete your profile to get started"}
              </CardDescription>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-2">
              <Badge variant={step >= 1 ? "default" : "secondary"} className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                1
              </Badge>
              <Separator className="w-8" />
              <Badge variant={step >= 2 ? "default" : "secondary"} className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                2
              </Badge>
              <Separator className="w-8" />
              <Badge variant={step >= 3 ? "default" : "secondary"} className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                3
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>

            <button
              onClick={sendCode}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        ) : step === 2 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2">
                Check your email for the 6-digit code
              </p>
            </div>

            <button
              onClick={verifyCode}
              disabled={loading || !code}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              onClick={() => {
                setStep(1);
                setCode("");
                setError("");
                setMessage("");
              }}
              className="w-full text-indigo-600 py-2 px-4 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              Use Different Email
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Your full name"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="University/College name"
                disabled={loading}
              />
            </div>

            <button
              onClick={completeProfile}
              disabled={loading || !name || !institution}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Completing..." : "Complete Profile"}
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </CardContent>
    </Card>
      </div>
    </div>
  );
}
