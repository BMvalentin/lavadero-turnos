"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageCircleMoreIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useActionState, useState, useMemo } from "react";
import { deleteTurno, completedTurno } from "@/actions/turno.actions";

// --- Interfaces y Estados Iniciales ---
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
  orderBy,
  orderDir = "desc", // Por defecto de más nuevo a más viejo
}: {
  turnos: TurnoConRelaciones[];
  orderBy?: string;
  orderDir?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";

  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTurnoId, setSelectedTurnoId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [actionType, setActionType] = useState<"cancel" | "complete" | null>(null);

  const [state, formAction] = useActionState(deleteTurno, initialState);
  const [stateComplete, formActionComplete] = useActionState(completedTurno, initialState);

  // --- Lógica de Filtrado por Fecha (Buenos Aires UTC-3) ---
  const { turnosHoy, todosLosTurnos } = useMemo(() => {
    const hoyBA = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
    
    // Si no hay orderBy manual, ordenamos por fecha descendente por defecto
    const turnosOrdenados = [...turnos].sort((a, b) => {
      if (!orderBy || orderBy === "horarioReservado") {
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

  // --- Manejo de UI ---
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

  // --- Componente de Tabla (Reusable) ---
  const TablaRender = ({ data, titulo }: { data: TurnoConRelaciones[], titulo: string }) => (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700 border-b pb-2 uppercase tracking-wider">{titulo}</h2>
      <div className="overflow-x-auto shadow-sm border rounded-lg bg-white">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="text-gray-700">
            <tr>
              <th className="p-2 border bg-gray-50 cursor-pointer hover:bg-blue-100" onClick={() => handleSort("horarioReservado")}>
                FECHA {orderBy === "horarioReservado" ? (orderDir === "asc" ? "▲" : "▼") : "↕"}
              </th>
              <th className="p-2 border bg-gray-50">CLIENTE</th>
              <th className="p-2 border bg-gray-50">SERVICIO</th>
              <th className="p-2 border bg-gray-50 text-center">ESTADO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">No hay turnos registrados aquí.</td></tr>
            ) : (
              data.map((turno) => (
                <tr
                  key={turno.id}
                  className={`hover:bg-blue-50/40 transition-colors text-center border-l-8 border-solid
                    ${turno.estado === 0 ? "!border-l-red-500" : ""}
                    ${turno.estado === 1 ? "!border-l-yellow-500" : ""}
                    ${turno.estado === 2 ? "!border-l-green-500" : ""}
                  `}
                >
                  <td className={`p-3 font-medium`}>
                    {new Date(turno.horarioReservado).toLocaleString("es-AR", {
                      day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="p-2 text-left">
                    <div className="flex items-center gap-3">
                      <Image src={turno.user.image || "/images/avatar-default.svg"} alt="Avatar" width={35} height={35} className="rounded-full" />
                      <div>
                        <div className="font-semibold leading-none">{turno.user.name || "Invitado"}</div>
                        <div className="text-[11px] text-gray-500 mb-1">{turno.user.email}</div>
                        {turno.user.telefono && (
                          <Link href={`https://wa.me/${turno.user.telefono.replace(/\D/g, "")}`} target="_blank" className="text-green-600 text-xs flex items-center gap-1 hover:underline">
                            <MessageCircleMoreIcon className="w-3 h-3" /> {turno.user.telefono}
                          </Link>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">{turno.vehiculo_servicio.vehiculo?.nombre}</div>
                    <div className="my-1"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">{turno.vehiculo_servicio.servicio?.nombre}</span></div>
                    <div className="font-mono text-[11px] font-bold text-slate-700 uppercase">{turno.patente}</div>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col items-center gap-1">
                      {turno.estado === 0 && <span className="font-bold text-red-600 text-xs">CANCELADO</span>}
                      {turno.estado === 1 && (
                        <>
                          <span className="font-bold text-yellow-600 text-xs">PENDIENTE</span>
                          <Button variant="amarillo" size="sm" className="h-7 text-[10px] px-2" onClick={() => openModal(turno.id)}>Cambiar</Button>
                        </>
                      )}
                      {turno.estado === 2 && <span className="font-bold text-green-600 text-xs">COMPLETADO</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <section className="space-y-10 my-6 relative">
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 italic">Orden actual: {orderDir === "desc" ? "Más recientes primero" : "Más antiguos primero"}</p>
      </div>

      {/* --- Tabla 1: Turnos de Hoy --- */}
      <TablaRender data={turnosHoy} titulo="📅 Turnos de Hoy" />

      {/* --- Tabla 2: Todos los Turnos --- */}
      <TablaRender data={todosLosTurnos} titulo="📋 Todos los Turnos" />

      {/* Feedback de Actions */}
      <div className="fixed bottom-4 right-4 z-40">
        {(state.success || stateComplete.success) && <div className="bg-green-100 text-green-800 p-3 rounded-lg shadow-lg border border-green-200 text-sm animate-bounce">✅ Acción realizada con éxito</div>}
        {(state.error || stateComplete.error) && <div className="bg-red-100 text-red-800 p-3 rounded-lg shadow-lg border border-red-200 text-sm">❌ {state.error || stateComplete.error}</div>}
      </div>

      {/* MODAL (Paso 1 y 2) */}
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