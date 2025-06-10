import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { Toaster } from "sonner";
import { UserProvider } from "./Usercontext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FusionPBX Dashboard",
  description: "Dashboard for FusionPBX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:bg-black dark:text-white`}
      >
        <UserProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
