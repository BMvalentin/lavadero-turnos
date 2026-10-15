import Buscador from "../../components/ui/bicicleta/Buscador";
import { obtenerTurnos } from "@/actions/admin.actions";
import ListaTurnos from "@/components/admin/ui/ListaTurnos";
import { Suspense } from "react";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BotonesLimpieza from "@/components/admin/ui/BotonesLimpieza";

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
    <main className="mt-20 p-6 gap-5">
      {/* Añadimos un contenedor flex para poner el título a la izquierda y los botones a la derecha */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
        <h1 className="text-2xl font-bold">🚗 Gestión de Turnos</h1>
        <BotonesLimpieza />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-5 mb-5">
        <Buscador />
        <div className="flex gap-3">
          <Link href="/diaLaboral">
            <Button variant={"celeste"}>Ir a gestion de dia laboral</Button>
          </Link>
          <Link href="/admin/configuracion">
            <Button variant={"celeste"}>Configuración</Button>
          </Link>
        </div>
      </div>

      <Suspense key={suspenseKey} fallback={<LoadingOverlay />}>
        <TurnosContainer params={sp} />
      </Suspense>
    </main>
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