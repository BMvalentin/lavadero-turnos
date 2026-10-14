"use client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { BookingProvider } from "@/app/context/Booking";
import SessionWrapper from "./providers/SessionWrapper";

export default function LayoutComponent({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  // El panel de administración tiene su propia navegación lateral.
  const esPanelAdmin = usePathname().startsWith("/admin");

  return (
    <SessionWrapper>
      <BookingProvider session={session}>
         {!esPanelAdmin && <Header session={session} />}
         {children}
      </BookingProvider>
    </SessionWrapper>
  );
}
