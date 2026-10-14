import "./globals.css";
import { auth } from "@/auth";
import type { Metadata } from "next";
import AppGate from "@/components/AppGate";
import NextTopLoader from 'nextjs-toploader';
import { Geist, Geist_Mono } from "next/font/google";
import LayoutComponent from "@/components/LayoutComponent";
import ToastProvider from "@/components/toast/ToastProvider";
import ConfirmProvider from "@/components/confirm/ConfirmContext";
import SiteConfigProvider from "@/components/providers/SiteConfigProvider";
import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import { esColorHex, temaColorCss } from "@/lib/siteConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { NOMBRE_EMPRESA, LOGO_URL } = await obtenerSiteConfig();
  return {
    title: `${NOMBRE_EMPRESA} - Lavadero`,
    description: `${NOMBRE_EMPRESA} - Reservá tu turno en línea de manera fácil y rápida.`,
    icons: {
      icon: LOGO_URL,
      shortcut: LOGO_URL,
      apple: LOGO_URL,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const siteConfig = await obtenerSiteConfig();
  const temaCss = temaColorCss(siteConfig.COLOR_PRINCIPAL);
  const colorLoader = esColorHex(siteConfig.COLOR_PRINCIPAL) ? siteConfig.COLOR_PRINCIPAL : "#6fa9da";
  return (
    <html lang="es" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-full`}>
        {temaCss && <style>{temaCss}</style>}
        <NextTopLoader color={colorLoader} showSpinner={true} height={3} zIndex={9999} />
        <SiteConfigProvider config={siteConfig}>
          <LayoutComponent session={session}>
            <AppGate>
              <ToastProvider>
                <ConfirmProvider>
                  {children}
                </ConfirmProvider>
              </ToastProvider>
            </AppGate>
          </LayoutComponent>
        </SiteConfigProvider>
      </body>
    </html>
  );
}