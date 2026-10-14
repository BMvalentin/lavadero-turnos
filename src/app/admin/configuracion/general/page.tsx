import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import SiteConfigForm from "../SiteConfigForm";
import SeccionHeader from "../SeccionHeader";
import { SECCIONES_GENERAL } from "../secciones";

export const metadata = { title: "Información general" };

export default async function InformacionGeneralPage() {
    const siteConfig = await obtenerSiteConfig();

    return (
        <div>
            <SeccionHeader
                titulo="Información general"
                descripcion="Nombre de la empresa y textos que se muestran en la web."
            />
            <SiteConfigForm secciones={SECCIONES_GENERAL} initialValues={siteConfig} />
        </div>
    );
}
