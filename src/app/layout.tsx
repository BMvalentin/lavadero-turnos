import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutComponent from "@/components/LayoutComponent";
import { auth } from "@/auth";
// 1. Importa el cargador
import NextTopLoader from 'nextjs-toploader';
import AppGate from "@/components/AppGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chapa Detail - Lavadero Santa Clara",
  description: "Lavadero de autos - Reserva tu turno en línea de manera fácil y rápida. Santa clara, Buenos Aires.",
  icons: {
    icon: "/images/logopng.png",
    shortcut: "/images/logopng.png",
    apple: "/images/logopng.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased w-dvw`}>
        {/* 2. Implementa el loader aquí */}
        <NextTopLoader 
          color="#6fa9da" // Tu color celeste característico
          showSpinner={true}
          height={3}
          zIndex={9999}
        />
        
        <LayoutComponent session={session}>
          <AppGate>
            {children}
          </AppGate>
        </LayoutComponent>
      </body>
    </html>
  );
}