// app/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';
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
            <Toaster
              position="top-right"
              gutter={10}
              containerStyle={{
                top: 20,
                right: 20,
              }}
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '12px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
                  letterSpacing: '-0.01em',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ecfdf5',
                  },
                  style: {
                    border: '1px solid #d1fae5',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#f43f5e',
                    secondary: '#fff1f2',
                  },
                  style: {
                    border: '1px solid #ffe4e6',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#2563eb',
                    secondary: '#eff6ff',
                  },
                  style: {
                    border: '1px solid #dbeafe',
                  },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
