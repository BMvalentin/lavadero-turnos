"use client";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { numeroWhatsApp } from "@/lib/siteConfig";
import { WhatsAppIcon, whatsAppUrl } from "@/components/WhatsAppIcon";

// Botón fijo abajo a la derecha que abre WhatsApp con el teléfono de Configuración.
export function WhatsAppFlotante() {
  const { TELEFONO } = useSiteConfig();
  const numero = numeroWhatsApp(TELEFONO);
  if (!numero) return null;

  return (
    <a
      href={whatsAppUrl(numero)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      title="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#128C7E]"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}
