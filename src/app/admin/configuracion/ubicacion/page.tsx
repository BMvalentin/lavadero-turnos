import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import SiteConfigForm from "../SiteConfigForm";
import SeccionHeader from "../SeccionHeader";
import { SECCIONES_UBICACION } from "../secciones";
import { mapaEmbedUrl, mapaLinkUrl } from "@/lib/siteConfig";

export const metadata = { title: "Ubicación y contacto" };

export default async function UbicacionPage() {
    const siteConfig = await obtenerSiteConfig();

    return (
        <div>
            <SeccionHeader
                titulo="Ubicación y contacto"
                descripcion="Dirección y teléfono de contacto, que también recibe los avisos de turnos por WhatsApp."
            />
            <SiteConfigForm secciones={SECCIONES_UBICACION} initialValues={siteConfig} />

            <section className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-celeste/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Vista previa del mapa</h2>
                        <p className="text-xs text-gray-500">
                            {siteConfig.MAPA_COORDENADAS
                                ? "Ubicado con el enlace de Google Maps."
                                : "Ubicado por la dirección. Si el punto no es exacto, pegá el enlace de Google Maps."}
                        </p>
                    </div>
                    <a
                        href={mapaLinkUrl(siteConfig)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-celeste-dark hover:underline"
                    >
                        Abrir en Google Maps
                    </a>
                </div>
                <iframe
                    src={mapaEmbedUrl(siteConfig.DIRECCION, siteConfig.MAPA_COORDENADAS)}
                    className="w-full h-72 rounded-lg border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Vista previa del mapa"
                />
            </section>
        </div>
    );
}
