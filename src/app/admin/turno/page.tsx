import { getTurnos } from "@/actions/turno.actions";
import TurnoList from "@/components/turno/TurnoList";
import CreateTurnoForm from "@/components/turno/CreateTurnoForm";
import EncabezadoPagina from "@/components/panel/EncabezadoPagina";
import ErrorCarga from "@/components/panel/ErrorCarga";
import { auth } from "@/auth";

export const metadata = { title: "Crear turno" };

export default async function AdminTurnoPage() {
  const session = await auth();
  const result = await getTurnos();

  return (
    <div>
      <EncabezadoPagina titulo="Crear turno" descripcion="Cargá un turno a nombre de un cliente." />

      <div className="mb-8">
        <CreateTurnoForm session={session} />
      </div>

      {result.success && result.data && Array.isArray(result.data) ? (
        <TurnoList session={session} turnos={result.data} />
      ) : (
        <ErrorCarga mensaje={result.error || "Error al cargar los turnos"} />
      )}
    </div>
  );
}
