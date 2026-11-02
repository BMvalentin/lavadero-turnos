import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import { coloresTema } from "@/lib/siteConfig";
import AparienciaForm from "./AparienciaForm";
import SeccionHeader from "../SeccionHeader";

export const metadata = { title: "Apariencia" };

export default async function AparienciaPage() {
    const siteConfig = await obtenerSiteConfig();

    return (
        <div>
            <SeccionHeader
                titulo="Apariencia"
                descripcion="Elegí una plantilla o personalizá los tres colores de la marca."
            />
            <AparienciaForm initialValues={coloresTema(siteConfig)} nombreEmpresa={siteConfig.NOMBRE_EMPRESA} />
        </div>
    );
}
