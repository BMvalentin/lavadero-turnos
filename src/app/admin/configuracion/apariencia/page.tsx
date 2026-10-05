import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import ColorForm from "./ColorForm";
import SeccionHeader from "../SeccionHeader";

export const metadata = { title: "Apariencia" };

export default async function AparienciaPage() {
    const siteConfig = await obtenerSiteConfig();

    return (
        <div>
            <SeccionHeader titulo="Apariencia" descripcion="Color principal de la marca en toda la web." />
            <ColorForm initialValue={siteConfig.COLOR_PRINCIPAL} />
        </div>
    );
}
