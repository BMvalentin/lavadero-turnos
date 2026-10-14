"use client";

import { createContext, useContext } from "react";
import { SITE_CONFIG_DEFAULTS, type SiteConfig } from "@/lib/siteConfig";

const SiteConfigContext = createContext<SiteConfig>(SITE_CONFIG_DEFAULTS);

export function useSiteConfig() {
  return useContext(SiteConfigContext);
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
