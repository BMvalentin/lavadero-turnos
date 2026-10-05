import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import SiteConfigForm from "../SiteConfigForm";
import SeccionHeader from "../SeccionHeader";
import { SECCIONES_UBICACION } from "../secciones";

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
        </div>
    );
}
