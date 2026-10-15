import Buscador from "../../components/ui/bicicleta/Buscador";
import { obtenerTurnos } from "@/actions/admin.actions";
import ListaTurnos from "@/components/admin/ui/ListaTurnos";
import { Suspense } from "react";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import BotonesLimpieza from "@/components/admin/ui/BotonesLimpieza";
import EncabezadoPagina from "@/components/panel/EncabezadoPagina";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    orderBy?: string;
    orderDir?: "asc" | "desc";
  }>;
}) {
  const sp = await searchParams;
  const suspenseKey = `${sp.orderBy}-${sp.orderDir}-${sp.search}`;

  return (
    <div>
      <EncabezadoPagina
        titulo="Turnos"
        descripcion="Buscá, ordená y gestioná los turnos reservados."
        acciones={<BotonesLimpieza />}
      />

      <div className="mb-5">
        <Buscador />
      </div>

      <Suspense key={suspenseKey} fallback={<LoadingOverlay />}>
        <TurnosContainer params={sp} />
      </Suspense>
    </div>
  );
}

async function TurnosContainer({ params }: { params: any }) {
  const turnos = await obtenerTurnos(params);
  return (
    <ListaTurnos
      turnos={turnos}
      orderBy={params.orderBy}
      orderDir={params.orderDir}
    />
  );
}
