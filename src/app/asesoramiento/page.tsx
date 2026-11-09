import Image from "next/image";
import { Car, Sparkles } from "lucide-react";
import { getServiciosAsesoramiento } from "@/actions/servicio-actions";
import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import { numeroWhatsApp } from "@/lib/siteConfig";
import { WhatsAppIcon, whatsAppUrl } from "@/components/WhatsAppIcon";

export const metadata = { title: "Asesoramiento" };

export default async function AsesoramientoPage() {
  const [servicios, { TELEFONO, NOMBRE_EMPRESA }] = await Promise.all([
    getServiciosAsesoramiento(),
    obtenerSiteConfig(),
  ]);
  const numero = numeroWhatsApp(TELEFONO);

  return (
    <main className="container mx-auto max-w-6xl px-4 pt-28 pb-16">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Asesoramiento</h1>
        <p className="mt-3 text-muted-foreground">
          Conocé en detalle cada uno de nuestros servicios. Si tenés dudas sobre cuál le conviene a tu vehículo,
          escribinos por WhatsApp y te asesoramos.
        </p>
      </header>

      {servicios === null ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          No pudimos cargar los servicios. Probá de nuevo en unos minutos.
        </p>
      ) : servicios.length === 0 ? (
        <p className="rounded-xl border border-dashed border-celeste/40 bg-white p-8 text-center text-muted-foreground">
          Todavía no hay servicios publicados.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {servicios.map((servicio) => {
            const mensaje = `Hola ${NOMBRE_EMPRESA}! Quisiera asesoramiento sobre el servicio "${servicio.nombre}".`;
            return (
              <article
                key={servicio.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-celeste/20 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/9] bg-secundario">
                  {servicio.srcImage ? (
                    <Image
                      src={servicio.srcImage}
                      alt={servicio.nombre}
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-celeste">
                      <Sparkles className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-4 p-6">
                  <h2 className="text-xl font-bold text-foreground">{servicio.nombre}</h2>

                  {servicio.vehiculos.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <Car className="h-4 w-4 text-celeste-dark" />
                      {servicio.vehiculos.map((v) => (
                        <span key={v} className="rounded-full bg-celeste/15 px-2.5 py-0.5 text-celeste-dark font-medium">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="flex-1 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                    {servicio.descripcion ||
                      "Consultanos por WhatsApp y te contamos en qué consiste este servicio, cómo lo hacemos y qué productos usamos."}
                  </p>

                  {numero && (
                    <a
                      href={whatsAppUrl(numero, mensaje)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-semibold text-white shadow-md transition-colors hover:bg-[#128C7E]"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      Pedir asesoramiento
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
