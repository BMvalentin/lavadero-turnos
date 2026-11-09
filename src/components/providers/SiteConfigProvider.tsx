"use client";

import { createContext, useContext } from "react";
import { SITE_CONFIG_DEFAULTS, opcionActiva, type SiteConfig } from "@/lib/siteConfig";

const SiteConfigContext = createContext<SiteConfig>(SITE_CONFIG_DEFAULTS);

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

// Configuración > Turnos y precios. Si está apagado, los precios no se
// muestran en ningún lado (web, panel admin ni formularios).
export function useMostrarPrecios() {
  return opcionActiva(useContext(SiteConfigContext).MOSTRAR_PRECIOS);
}

export default function SiteConfigProvider({
  config,
  children,
}: {
  config: SiteConfig;
  children: React.ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}
