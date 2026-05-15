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

import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/Sidebar'

export const metadata: Metadata = {
  title: "Timetable Planner Pro",
  description: "Intelligent role-based academic timetable management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let role = undefined
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile) role = profile.role
    }
  } catch (e) {
    // If Supabase is not configured yet or error occurs, skip auth fetching
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <div className="flex flex-1">
          {role && <Sidebar role={role} />}
          <main className={`flex-1 transition-all duration-300 ${role ? 'ml-20 print:ml-0' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
