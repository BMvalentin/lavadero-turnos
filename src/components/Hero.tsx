"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, Clock, Shield} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

interface HeroProps {
  onBookingClick: () => void;
}

export function Hero({ onBookingClick }: HeroProps) {
  const config = useSiteConfig();

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={config.BANNER_URL}
          alt={`Banner ${config.NOMBRE_EMPRESA}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black via-black/40 to-black/0" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 pt-20">
        <div className="max-w-2xl">

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white"
          >
            <span>{config.HERO_TITULO}{" "} <span className="bg-linear-to-r from-[#a3e8ff] to-white bg-clip-text text-shadow-md text-shadow-white">{config.HERO_TITULO_DESTACADO}</span></span> 
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-white/70 mb-8 max-w-lg"
          >
            {config.HERO_DESCRIPCION}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link href="/turno">
              <Button variant="celeste" size="lg">
                Reservar Turno Ahora
              </Button>
            </Link>
            <Button variant="blanco" asChild>
              <Link href="#servicios">Ver Servicios</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-6"
          >
            {[
              { icon: Clock, text: "Reserva en 1 minuto" },
              { icon: Shield, text: "Productos premium" },
              { icon: Sparkles, text: "Acabado impecable" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-white/60">
                <item.icon className="w-4 h-4 text-celeste" />
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
