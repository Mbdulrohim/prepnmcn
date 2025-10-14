import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "O/Prep Admin - Exam Preparation Platform",
  description:
    "Your ultimate exam preparation platform. Master your exams with O/Prep's comprehensive study tools and resources.",
  keywords: [
    "exam preparation",
    "study planner",
    "O/Prep",
    "online learning",
    "test preparation",
  ],
  authors: [{ name: "O/Prep Team" }],
  creator: "O/Prep",
  publisher: "O/Prep",
  icons: {
    icon: "/preplogo.png",
    shortcut: "/preplogo.png",
    apple: "/preplogo.png",
  },
  openGraph: {
    title: "O/Prep Admin - Exam Preparation Platform",
    description:
      "Master your exams with O/Prep's comprehensive study platform.",
    url: "https://prepp-8ysa0a4zd-mbdulrohims-projects.vercel.app",
    siteName: "O/Prep Admin",
    images: [
      {
        url: "/preplogo.png",
        width: 1200,
        height: 630,
        alt: "O/Prep Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "O'Prep - Exam Preparation Platform",
    description:
      "Master your exams with O'Prep's comprehensive study platform.",
    images: ["/preplogo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import ConditionalHeader from "@/components/ConditionalHeader";
import { Toaster } from "@/components/ui/sonner";

import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConditionalHeader />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
