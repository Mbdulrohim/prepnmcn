import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "OPREP - Online Professional Readiness and Exam Preparation",
  description:
    "Structured preparation for nursing and midwifery licensing examinations (RN, RM, RPHN): study plans, lecture notes, CBT practice, assessments and mock exams.",
  keywords: [
    "OPREP",
    "NMCN exam preparation",
    "nursing licensing exam",
    "midwifery licensing exam",
    "RN RM RPHN",
    "CBT practice questions",
  ],
  authors: [{ name: "OPREP Team" }],
  creator: "OPREP",
  publisher: "OPREP",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: "/preplogo.png",
    shortcut: "/preplogo.png",
    apple: "/preplogo.png",
  },
  openGraph: {
    title: "OPREP - Online Professional Readiness and Exam Preparation",
    description:
      "Structured preparation for nursing and midwifery licensing examinations.",
    url: "new.",
    siteName: "OPREP",
    images: [
      {
        url: "/preplogo.png",
        width: 1200,
        height: 630,
        alt: "OPREP Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OPREP - Online Professional Readiness and Exam Preparation",
    description:
      "Structured preparation for nursing and midwifery licensing examinations.",
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
import SiteFooter from "@/components/SiteFooter";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body
        className={`${dmSans.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <ConditionalHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster />
            <FloatingChat />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
