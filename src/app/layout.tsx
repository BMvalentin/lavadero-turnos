import "./globals.css";
import { auth } from "@/auth";
import type { Metadata } from "next";
import AppGate from "@/components/AppGate";
import NextTopLoader from 'nextjs-toploader';
import { Geist, Geist_Mono } from "next/font/google";
import LayoutComponent from "@/components/LayoutComponent";
import ToastProvider from "@/components/toast/ToastProvider";
import ConfirmProvider from "@/components/confirm/ConfirmContext";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="es" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-full`}>
        <NextTopLoader color="#6fa9da" showSpinner={true} height={3} zIndex={9999} />
        <LayoutComponent session={session}>
          <AppGate>
            <ToastProvider>
              <ConfirmProvider>
                {children}
              </ConfirmProvider>
            </ToastProvider>
          </AppGate>
        </LayoutComponent>
      </body>
    </html>
  );
}