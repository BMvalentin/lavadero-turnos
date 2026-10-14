import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import SiteImagesForm from "../SiteImagesForm";
import SeccionHeader from "../SeccionHeader";

export const metadata = { title: "Imágenes" };

export default async function ImagenesPage() {
    const siteConfig = await obtenerSiteConfig();

    return (
        <div>
            <SeccionHeader titulo="Imágenes" descripcion="Logo de la empresa y banner de la página de inicio." />
            <SiteImagesForm logoUrl={siteConfig.LOGO_URL} bannerUrl={siteConfig.BANNER_URL} />
        </div>
    );
}
