// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import Stars from "@/components/Stars";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard for the application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-500/30`}>
        <AuthProvider>
          <SocketProvider>
            <div className="print:hidden">
              <Stars />
            </div>
            <main className="relative z-10 w-full h-full">
              {children}
            </main>
            <Toaster position="bottom-right" toastOptions={{
              className: 'bg-slate-900 border border-white/10 text-slate-100',
              style: {
                background: '#0f172a',
                color: '#f1f5f9',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }} />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

