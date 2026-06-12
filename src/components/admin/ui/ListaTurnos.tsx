"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useActionState, useState, useMemo, useEffect } from "react";
import { deleteTurno, completedTurno } from "@/actions/turno.actions";
import { useToast } from "@/hooks/useToast";          // <-- nuevo
import { TablaRender } from "./TablaRender";            // Ajustá la ruta

const initialState = { success: false, error: undefined, data: undefined };

interface TurnoConRelaciones {
  id: string;
  horarioReservado: Date;
  patente: string;
  estado: number;
  precioCongelado: number;
  seniaCongelada: number;
  user: {
    name: string | null;
    email: string;
    telefono?: string | null;
    image: string | null;
  };
  vehiculo_servicio: {
    precio: number;
    servicio: { nombre: string | null } | null;
    vehiculo: { nombre: string | null } | null;
  };
}

export default function ListaTurnos({
  turnos,
  orderBy = "horarioReservado",
  orderDir = "desc",
}: {
  turnos: TurnoConRelaciones[];
  orderBy?: string;
  orderDir?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTurnoId, setSelectedTurnoId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [actionType, setActionType] = useState<"cancel" | "complete" | null>(null);

  const [state, formAction] = useActionState(deleteTurno, initialState);
  const [stateComplete, formActionComplete] = useActionState(completedTurno, initialState);
  const { addToast } = useToast();

  // Toasts en lugar de divs fijos
  useEffect(() => {
    if (state.success) addToast("Turno cancelado exitosamente", "success");
    if (state.error)   addToast("Error al cancelar el turno", "error");
  }, [state.success, state.error, addToast]);

  useEffect(() => {
    if (stateComplete.success) addToast("Turno completado exitosamente", "success");
    if (stateComplete.error)   addToast("Error al completar el turno", "error");
  }, [stateComplete.success, stateComplete.error, addToast]);

  // --- Lógica de Filtrado por Fecha (Buenos Aires UTC-3) ---
  const { turnosHoy, todosLosTurnos } = useMemo(() => {
    const hoyBA = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
    
    const turnosOrdenados = [...turnos].sort((a, b) => {
      if (orderBy === "horarioReservado") {
        const dateA = new Date(a.horarioReservado).getTime();
        const dateB = new Date(b.horarioReservado).getTime();
        return orderDir === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return {
      turnosHoy: turnosOrdenados.filter(t => 
        new Date(t.horarioReservado).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }) === hoyBA
      ),
      todosLosTurnos: turnosOrdenados
    };
  }, [turnos, orderDir, orderBy]);

  const handleSort = (campo: string) => {
    const isActive = orderBy === campo;
    const nextDir = isActive && orderDir === "asc" ? "desc" : "asc";
    router.push(`/admin?orderBy=${campo}&orderDir=${nextDir}${currentSearch ? `&search=${currentSearch}` : ""}`);
  };

  const openModal = (id: string) => {
    setSelectedTurnoId(id);
    setModalStep(1);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <section className="space-y-10 my-6 relative">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 italic">
          Orden actual: {orderDir === "desc" ? "Más recientes primero" : "Más antiguos primero"}
        </p>
      </div>

      {/* Tablas con todas las props */}
      <TablaRender
        data={turnosHoy}
        titulo="📅 Turnos de Hoy"
        orderBy={orderBy}
        orderDir={orderDir as "asc" | "desc"}
        handleSort={handleSort}
        openModal={openModal}
      />

      <TablaRender
        data={todosLosTurnos}
        titulo="📋 Todos los Turnos"
        orderBy={orderBy}
        orderDir={orderDir as "asc" | "desc"}
        handleSort={handleSort}
        openModal={openModal}
      />

      {/* MODAL (sin cambios) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200">
            {modalStep === 1 ? (
              <>
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-black text-slate-800">GESTIONAR TURNO</h3>
                  <p className="text-sm text-slate-500 italic">Selecciona el nuevo estado</p>
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <Button variant="verde" className="w-full font-bold py-6" onClick={() => { setActionType("complete"); setModalStep(2); }}>✓ COMPLETAR TURNO</Button>
                  <Button variant="rojo" className="w-full font-bold py-6" onClick={() => { setActionType("cancel"); setModalStep(2); }}>✕ CANCELAR TURNO</Button>
                  <Button variant="outline" className="w-full" onClick={closeModal}>VOLVER</Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-3">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${actionType === 'complete' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {actionType === 'complete' ? '✅' : '⚠️'}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Confirmar acción</h3>
                  <p className="text-sm text-slate-500">
                    ¿Confirmas que deseas pasar este turno a <span className="font-bold underline">{actionType === 'complete' ? 'COMPLETADO' : 'CANCELADO'}</span>?
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button variant="rojo" className="flex-1" onClick={() => setModalStep(1)}>VOLVER</Button>
                  <form action={actionType === "cancel" ? formAction : formActionComplete} onSubmit={closeModal} className="flex-1">
                    <input type="hidden" name="id" value={selectedTurnoId!} />
                    <Button type="submit" variant="verde" className="w-full font-bold">ACEPTAR</Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}