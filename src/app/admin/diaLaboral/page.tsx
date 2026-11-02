import { DiaLaboralClient } from "@/components/diaLaboral/diaLaboralClient";
import { getDiasLaborales } from "@/actions/diaLaboral.actions";
import EncabezadoPagina from "@/components/panel/EncabezadoPagina";

export const metadata = { title: "Días laborales" };

export default async function DiaLaboralPage() {
  const diasLaborales = await getDiasLaborales();

  return (
    <div>
      <EncabezadoPagina
        titulo="Días laborales"
        descripcion="Configurá los días de la semana habilitados para trabajo."
      />
      <DiaLaboralClient initialData={diasLaborales} />
    </div>
  );
}
