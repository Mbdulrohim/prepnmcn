"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  PREPNMCN
                </span>
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
              <Badge
                variant={step >= 1 ? "default" : "secondary"}
                className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
              >
                1
              </Badge>
              <Separator className="w-8" />
              <Badge
                variant={step >= 2 ? "default" : "secondary"}
                className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
              >
                2
              </Badge>
              <Separator className="w-8" />
              <Badge
                variant={step >= 3 ? "default" : "secondary"}
                className="w-8 h-8 rounded-full p-0 flex items-center justify-center"
              >
                3
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    disabled={loading}
                    className="h-12"
                  />
                </div>

                <Button
                  onClick={sendCode}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </div>
            ) : step === 2 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                    className="text-center text-2xl tracking-widest font-mono h-16"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Check your email for the 6-digit code
                  </p>
                </div>

                <Button
                  onClick={verifyCode}
                  disabled={loading || !code}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  onClick={() => {
                    setStep(1);
                    setCode("");
                    setError("");
                    setMessage("");
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Use Different Email
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    disabled={loading}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="University/College name"
                    disabled={loading}
                    className="h-12"
                  />
                </div>

                <Button
                  onClick={completeProfile}
                  disabled={loading || !name || !institution}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  {loading ? "Completing..." : "Complete Profile"}
                </Button>
              </div>
            )}

            <div className="pt-6 border-t">
              <p className="text-xs text-center text-muted-foreground">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary font-medium text-sm"
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
