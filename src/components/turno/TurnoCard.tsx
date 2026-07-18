"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom"; // Cambiado para mayor compatibilidad
import { deleteTurno, completedTurno } from "@/actions/turno.actions";
import EditTurnoModal from "./EditarTurnoModal";
import { Button } from "../ui/button";

const initialState = { success: false, error: undefined, data: undefined };

export default function TurnoCard({ session, turno }: { session: any; turno: any }) {
  const router = useRouter();
  const [state, formAction] = useFormState(deleteTurno, initialState);
  const [stateComplete, formActionComplete] = useFormState(completedTurno, initialState);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatFecha = (fecha: Date) => new Date(fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatPrecio = (precio: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);

  const fechaTurno = new Date(turno.horarioReservado);
  const hoy = new Date();
  const isPasado = fechaTurno < hoy;
  const isHoy = fechaTurno.toDateString() === hoy.toDateString();

  return (
    <>
      <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${isPasado ? 'opacity-75' : ''}`}>
        <div className={`p-4 text-white ${isPasado ? 'bg-gray-500' : isHoy ? 'bg-green-700' : 'bg-[#6fa9da]'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{isPasado ? '🕐 Pasado' : isHoy ? '📅 Hoy' : '📅 Próximo'}</p>
              <p className="font-bold text-lg">{formatFecha(fechaTurno)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Patente</p>
              <p className="font-bold text-xl">{turno.patente}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase">Cliente</p>
            <p className="font-semibold text-gray-800">{turno.user.name}</p>
          </div>
          <div className="border-t pt-3">
             <p className="font-semibold text-gray-800">{turno.vehiculo_servicio.vehiculo.nombre} - {turno.vehiculo_servicio.servicio.nombre}</p>
          </div>

          {!state.success && !stateComplete.success && (
            <div className="flex gap-2 pt-3">
              {session?.user.role === "ADMIN" && isPasado && (
                <form action={formActionComplete}>
                  <input type="hidden" name="id" value={turno.id} />
                  <Button type="submit" variant="verde" className="flex-1 text-sm">Completar</Button>
                </form>
              )}
              <Button onClick={() => setShowEditModal(true)} variant="celeste" className="flex-1 text-sm">Editar</Button>
              <form action={formAction}>
                <input type="hidden" name="id" value={turno.id} />
                <Button type="submit" variant="rojo" className="text-sm">Cancelar</Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditTurnoModal session={session} turno={turno} onClose={() => setShowEditModal(false)} />
      )}
    </>
  );
}