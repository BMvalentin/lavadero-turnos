import { obtenerSiteConfig } from "@/actions/configuracion.actions";
import SeccionHeader from "../SeccionHeader";
import OpcionesTurnosForm from "./OpcionesTurnosForm";

export const metadata = { title: "Turnos y precios" };

export default async function TurnosConfigPage() {
    const { TURNOS_HABILITADOS, MOSTRAR_PRECIOS } = await obtenerSiteConfig();

    return (
        <div>
            <SeccionHeader
                titulo="Turnos y precios"
                descripcion="Activá o desactivá la reserva de turnos y la visibilidad de los precios en la web. Los cambios se aplican al instante."
            />
            <OpcionesTurnosForm valores={{ TURNOS_HABILITADOS, MOSTRAR_PRECIOS }} />
        </div>
    );
}
