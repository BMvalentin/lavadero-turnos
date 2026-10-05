"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Code2, MapPin, Phone } from "lucide-react";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { DESARROLLADOR } from "@/lib/siteConfig";

const navegacion = [
  { label: "Inicio", href: "/#home" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Ubicación", href: "/#ubicacion" },
  { label: "Turnos", href: "/turno" },
];

export function Footer({
  openPrivacy,
  openTerms,
}: {
  openPrivacy: () => void;
  openTerms: () => void;
}) {
  const config = useSiteConfig();
  const telefonoHref = `tel:${config.TELEFONO.replace(/[^\d+]/g, "")}`;
  const mapaHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.DIRECCION)}`;

  const creditoContenido = (
    <>
      <Code2 className="w-3.5 h-3.5" />
      <span>Creado por</span>
      <span className="font-bold tracking-wide text-foreground">{DESARROLLADOR.nombre}</span>
    </>
  );
  const creditoClases =
    "inline-flex items-center gap-2 rounded-full border border-celeste/30 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-celeste hover:bg-celeste/10 hover:text-foreground";

  return (
    <footer className="bg-white text-muted-foreground border-t border-celeste/20">
      <div className="container mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1.3fr_1fr]">
          {/* Marca + descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src={config.LOGO_URL}
                alt={`Logo ${config.NOMBRE_EMPRESA}`}
                width={40}
                height={40}
                className="h-10 w-auto max-w-20 object-contain"
              />
              <span className="text-lg font-bold uppercase tracking-wide text-foreground">
                {config.NOMBRE_EMPRESA}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-md whitespace-pre-line">
              {config.FOOTER_DESCRIPCION}
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-celeste-dark">Navegación</h3>
            <ul className="space-y-2.5">
              {navegacion.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-celeste-dark transition-transform group-hover:translate-x-0.5" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-celeste-dark">Contacto</h3>
            <ul className="space-y-4">
              <li>
                <a href={telefonoHref} className="inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4 shrink-0 text-celeste-dark" />
                  {config.TELEFONO}
                </a>
              </li>
              <li>
                <a
                  href={mapaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-celeste-dark" />
                  {config.DIRECCION}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-celeste-dark">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={openTerms}
                  className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Términos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openPrivacy}
                  className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacidad
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-celeste/20 pt-6 md:grid md:grid-cols-3">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} {config.NOMBRE_EMPRESA}. Todos los derechos reservados.
          </p>
          {DESARROLLADOR.url ? (
            <a href={DESARROLLADOR.url} target="_blank" rel="noopener noreferrer" className={`${creditoClases} md:justify-self-center`}>
              {creditoContenido}
            </a>
          ) : (
            <span className={`${creditoClases} md:justify-self-center`}>{creditoContenido}</span>
          )}
        </div>
      </div>
    </footer>
  );
}
