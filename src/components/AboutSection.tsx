"use client";
import { motion } from "framer-motion";
import { Award, Users, Droplets } from "lucide-react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";

const features = [
  {
    icon: Award,
    title: "Calidad Garantizada",
    description: "Utilizamos productos de primera línea y técnicas profesionales.",
  },
  {
    icon: Users,
    title: "Equipo Profesional",
    description: "Personal capacitado con años de experiencia en el rubro.",
  },
  {
    icon: Droplets,
    title: "Cuidado Ecológico",
    description: "Procesos que cuidan tu vehículo y el medio ambiente.",
  },
];

export function AboutSection() {
  const config = useSiteConfig();

  return (
    <section id="nosotros" className="py-20 md:py-32 mx-auto px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border-primary border-2 px-4 py-8 shadow-2xl"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Sobre <span className="text-celeste-dark">Nosotros</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed whitespace-pre-line">
              {config.NOSOTROS_PARRAFO_1}
            </p>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {config.NOSOTROS_PARRAFO_2}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex gap-4 p-6 rounded-xl bg-white border border-celeste/20 hover:border-celeste/50 transition-all shadow-2xl"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-celeste-dark" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
