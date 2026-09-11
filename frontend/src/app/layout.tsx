// app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import Stars from "@/components/Stars";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Attendance - Enterprise Dashboard",
  description: "High-performance facial recognition and telemetry attendance management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased selection:bg-blue-500/30 bg-slate-950 text-slate-100`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <SocketProvider>
            <div className="print:hidden">
              <Stars />
            </div>
            <main className="relative z-10 w-full min-h-screen">
              {children}
            </main>
            <Toaster position="bottom-right" toastOptions={{
              className: 'bg-slate-900 border border-slate-800 text-slate-100',
              style: {
                background: '#0f172a',
                color: '#f1f5f9',
                border: '1px solid #1e293b',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              },
            }} />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

