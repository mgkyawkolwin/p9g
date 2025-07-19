
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import GlobalErrorHandler from "./globalerrorhandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Console - NextJS",
  description: "NextJS, Shadcn UI, Tailwind Css, Drizzle ORM, Inversify DI, MySql Db",
};

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
        <GlobalErrorHandler />
        <div className="flex flex-1 min-w-screen min-h-screen">
          <Toaster position="top-center" richColors/>
          {children}
        </div>
      </body>
    </html>
  );
}
