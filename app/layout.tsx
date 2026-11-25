import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Ledger — Payments",
  description: "A simple, honest record of every payment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col text-ink">
        <div className="orb-field" aria-hidden>
          <div className="orb orb-teal" />
          <div className="orb orb-violet" />
          <div className="orb orb-gold" />
        </div>
        <div className="relative z-10 flex flex-col flex-1">
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}

