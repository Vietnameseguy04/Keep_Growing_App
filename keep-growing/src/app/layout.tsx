import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes } from "next/font/google";
import "./globals.css";
import LikeNotifications from "./(mainpage)/blumengarten/freunde/LikeNotifications";
import ServiceWorkerRegistrar from "./ServiceWorkerRegistrar";

// 1. Standard Schriftart (Modern/Clean)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 2. Monospace Schriftart (für Daten/Zahlen)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 3. Schnörkelschrift (für das "hello florian")
const cursive = Great_Vibes({
  variable: "--font-cursive",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keep Growing",
  description: "Flower your mind",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Keep Growing",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${cursive.variable} 
          antialiased
        `}
      >
        <LikeNotifications />
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}