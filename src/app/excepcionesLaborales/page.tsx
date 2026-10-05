import { redirect } from "next/navigation";

// Los feriados se gestionan ahora desde Configuración.
export default function ExcepcionesLaboralesPage() {
  redirect("/admin/configuracion/feriados");
}
