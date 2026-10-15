"use client";
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
  return (
    <SessionWrapper>
      <BookingProvider session={session}>
         <Header session={session} />
         {children}
      </BookingProvider>
    </SessionWrapper>
  );
}