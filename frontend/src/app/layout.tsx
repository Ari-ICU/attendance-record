// app/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import "./globals.css";

export const metadata: Metadata = {
  title: "Staff Attendance - Workforce Management System",
  description: "Advanced biometric facial recognition and staff workforce attendance system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased selection:bg-blue-500/20 bg-slate-50 text-slate-900"
        suppressHydrationWarning
      >
        <AuthProvider>
          <SocketProvider>
            <main className="relative z-10 w-full min-h-screen">
              {children}
            </main>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
