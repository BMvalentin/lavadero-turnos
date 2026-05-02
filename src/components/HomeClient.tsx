"use client";

import { Hero } from "@/components/Hero";
import { ImageCarousel } from "@/components/ImageCarousel";
import { AboutSection } from "@/components/AboutSection";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
import { useBooking } from "@/app/context/Booking";

export default function HomeClient() {
  const { onOpen } = useBooking();

  return (
      <div className="min-h-screenjustify-center items-center mx-auto bg-blue-50 overflow-hidden">
        <main>
          <Hero onBookingClick={onOpen} />
          <ImageCarousel />
          <AboutSection />
          <LocationSection />
        </main>
      </div>
  );
}
