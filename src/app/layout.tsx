import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
import { ThemeProvider } from "next-themes";
import FloatingChat from "@/components/FloatingChat";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ConditionalHeader />
            {children}
            <Toaster />
            <FloatingChat />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
