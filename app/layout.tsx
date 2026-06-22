import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Exam-Mada',
  description: 'Plateforme de gestion des examens nationaux de Madagascar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
          
          <Toaster position="top-right" toastOptions={{
            style: { background: '#15171C', color: '#F4F4EE', border: 'none', borderRadius: 14, padding: '12px 16px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 500 },
            success: { iconTheme: { primary: '#CDF564', secondary: '#15171C' } },
            error: { iconTheme: { primary: '#FCA5A5', secondary: '#15171C' } },
          }} />
        </AuthProvider>
      </body>
    </html>
  );
}
