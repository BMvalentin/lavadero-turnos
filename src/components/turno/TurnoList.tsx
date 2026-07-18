"use client";

import { deleteTurno, completedTurno } from "@/actions/turno.actions";
import { useActionState } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import EditTurnoModal from "./EditarTurnoModal";
import { Button } from "../ui/button";
import { useMemo } from "react";

const initialState = {
  success: false,
  error: undefined,
  data: undefined
};
const initialStateComplete = {
  success: false,
  error: undefined,
  data: undefined
};

type Turno = {
  id: string;
  horarioReservado: Date;
  patente: string;
  precioCongelado: number;
  seniaCongelada: number;
  estado: number;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  vehiculo_servicio: {
    id: string;
    vehiculo: {
      id: string;
      nombre: string | null;
    };
    servicio: {
      id: string;
      nombre: string | null;
    };
    duracion: number;
  };
};

export default function TurnoList({ session, turnos }: { session: any; turnos: Turno[] }) {
  if (!Array.isArray(turnos)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: datos inválidos</p>
      </div>
    );
  }

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const { turnosHoy, turnosRestantes } = useMemo(() => {
    const hoy = new Date().toDateString();

    const hoyList: Turno[] = [];
    const restoList: Turno[] = [];

    turnos.forEach((t) => {
      const fechaTurno = new Date(t.horarioReservado).toDateString();
      if (fechaTurno === hoy) {
        hoyList.push(t);
      } else {
        restoList.push(t);
      }
    });

    hoyList.sort((a, b) =>
      new Date(a.horarioReservado).getTime() - new Date(b.horarioReservado).getTime()
    );

    restoList.sort((a, b) =>
      new Date(b.horarioReservado).getTime() - new Date(a.horarioReservado).getTime()
    );

    return { turnosHoy: hoyList, turnosRestantes: restoList };
  }, [turnos]);

  if (turnos.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No hay turnos reservados</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* SECCIÓN: HOY */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
          <h2 className="text-xl font-bold text-gray-800">Turnos de Hoy</h2>
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            {turnosHoy.length}
          </span>
        </div>

        {turnosHoy.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turnosHoy.map((turno: Turno) => (
              <TurnoCard session={session} key={turno.id} turno={turno} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-dashed text-sm">
            No hay turnos programados para el día de hoy.
          </p>
        )}
      </section>

      <hr className="border-gray-200" />

      {/* SECCIÓN: RESTO (Historial y Futuros) */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Otros Turnos</h2>
        {turnosRestantes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turnosRestantes.map((turno: Turno) => (
              <TurnoCard session={session} key={turno.id} turno={turno} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay más turnos en el sistema.</p>
        )}
      </section>
    </div>
  );
}

function TurnoCard({ session, turno }: { session: any; turno: Turno }) {
  const router = useRouter();
  const [state, formAction] = useActionState(deleteTurno, initialState);
  const [stateComplete, formActionComplete] = useActionState(completedTurno, initialStateComplete);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  // Determinar si el turno es pasado, hoy o futuro
  const fechaTurno = new Date(turno.horarioReservado);
  const hoy = new Date();
  const isPasado = fechaTurno < hoy;
  const isHoy = fechaTurno.toDateString() === hoy.toDateString();

  return (
    <>
      <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${isPasado ? 'opacity-75' : ''
        }`}>
        {/* Header */}
        <div className={`p-4 text-white ${isPasado ? 'bg-gray-500' : isHoy ? 'bg-green-700' : 'bg-[#6fa9da]'
          }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">
                {isPasado ? '🕐 Pasado' : isHoy ? '📅 Hoy' : '📅 Próximo'}
              </p>
              <p className="font-bold text-lg">{formatFecha(fechaTurno)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Patente</p>
              <p className="font-bold text-xl">{turno.patente}</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase">Cliente</p>
            <p className="font-semibold text-gray-800">{turno.user.name}</p>
            {turno.user.email && (
              <p className="text-sm text-gray-600">{turno.user.email}</p>
            )}
          </div>

          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 uppercase">Servicio</p>
            <p className="font-semibold text-gray-800">
              {turno.vehiculo_servicio.vehiculo.nombre} - {turno.vehiculo_servicio.servicio.nombre}
            </p>
            <p className="text-sm text-gray-600">
              Duración: {turno.vehiculo_servicio.duracion} min
            </p>
          </div>

          <div className="border-t pt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Precio</p>
              <p className="font-bold text-green-600">
                {formatPrecio(turno.precioCongelado)}
              </p>
            </div>
            {turno.seniaCongelada > 0 && (
              <div>
                <p className="text-xs text-gray-500">Seña</p>
                <p className="font-bold text-blue-600">
                  {formatPrecio(turno.seniaCongelada)}
                </p>
              </div>
            )}
          </div>

          {/* Acciones — se ocultan mientras se muestra el resultado, para no confundir */}
          {!state.success && !stateComplete.success && (
            <div className="flex gap-2 pt-3">
              {(session?.user.role === "ADMIN" && isPasado) &&
                <form className="w-full flex flex-wrap" action={formActionComplete}>
                  <input type="hidden" name="id" value={turno.id} />

                  <Button
                    onClick={(e) => {
                      if (!confirm('¿Estás seguro de completar este turno?')) {
                        e.preventDefault();
                      }
                    }}
                    type="submit"
                    variant={"verde"}
                    className="flex-1 py-2 rounded text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Completar
                  </Button></form>}
              {(session?.user.role === "ADMIN" && !isPasado) &&
                <Button
                  onClick={() => setShowEditModal(true)}
                  variant={"celeste"}
                  className="flex-1 py-2 rounded text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Editar
                </Button>}
              {session?.user.role !== "ADMIN" && <Button
                onClick={isPasado ? () => { } : () => setShowEditModal(true)}
                variant={isPasado ? "ghost" : "celeste"}
                disabled={isPasado}
                className="flex-1 py-2 rounded text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isPasado ? "Fecha pasada por gestionar" : "Editar"}
              </Button>}

              <form action={formAction}>
                <input type="hidden" name="id" value={turno.id} />
                <Button
                  type="submit"
                  variant={"rojo"}
                  onClick={(e) => {
                    if (!confirm('¿Estás seguro de cancelar este turno?')) {
                      e.preventDefault();
                    }
                  }}
                  className="px-4 py-2text-sm font-medium"
                >
                  Cancelar
                </Button>
              </form>
            </div>
          )}

          {state.error && (
            <p className="text-red-600 text-xs mt-2">{state.error}</p>
          )}
          {state.success && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-center space-y-2">
              <p className="text-red-700 text-sm font-medium">✅ Turno cancelado</p>
              {state.data?.whatsappUrl && (
                <a
                  href={state.data.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#25D366] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#128C7E] transition-colors w-full"
                >
                  Notificar Cancelación
                </a>
              )}
              <button
                type="button"
                onClick={() => router.refresh()}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Listo, cerrar
              </button>
            </div>
          )}
          {stateComplete.error && (
            <p className="text-red-600 text-xs mt-2">{stateComplete.error}</p>
          )}
          {stateComplete.success && (
            <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg text-center space-y-2">
              <p className="text-green-700 text-sm font-medium">✅ Turno completado</p>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Listo, cerrar
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditTurnoModal
          session={session}
          turno={turno}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}