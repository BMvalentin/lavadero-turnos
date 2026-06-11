import { getTurnos } from "@/actions/turno.actions";
import TurnoList from "@/components/turno/TurnoList";
import CreateTurnoForm from "@/components/turno/CreateTurnoForm";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TurnoPage() {
  const session = await auth();
  if (!session?.user) { redirect("/login"); }
  const result = (session?.user.role === "ADMIN") ? await getTurnos() : await getTurnos({ userId: session?.user.id });

  return (
    <div className="container mx-auto p-6 max-w-7xl mt-20">
      <div className="mb-8 flex-col md:flex-row">
        <h1 className="text-3xl font-bold mb-2">Gestión de Turnos</h1>
      </div>

      <div className="mb-8">
        <CreateTurnoForm session={session} />
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        {result.success && result.data && Array.isArray(result.data) ? (
          <TurnoList session={session} turnos={result.data} />
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">
              {result.error || "Error al cargar los turnos"}
            </p>
          </div>
        )}
      </Suspense>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}