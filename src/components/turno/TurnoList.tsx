"use client";

import { deleteTurno, completedTurno } from "@/actions/turno.actions";
import { useActionState, useEffect, useRef, useState } from "react";
import EditTurnoModal from "./EditarTurnoModal";
import { Button } from "../ui/button";
import { useMemo } from "react";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
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
            {turnosHoy.map((turno) => (
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

      {/* SECCIÓN: RESTO */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Otros Turnos</h2>
        {turnosRestantes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turnosRestantes.map((turno) => (
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
  const [state, formAction] = useActionState(deleteTurno, initialState);
  const [stateComplete, formActionComplete] = useActionState(completedTurno, initialState);
  const [showEditModal, setShowEditModal] = useState(false);
  const completeFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const { confirm } = useConfirm();
  const { addToast } = useToast();

  // Toasts para la acción de eliminación
  useEffect(() => {
    if (state.success) {
      addToast("Turno cancelado exitosamente", "success");
    }
    if (state.error) {
      addToast("Error al cancelar el turno", "error");
    }
  }, [state.success, state.error, addToast]);

  // Toasts para la acción de completar
  useEffect(() => {
    if (stateComplete.success) {
      addToast("Turno completado exitosamente", "success");
    }
    if (stateComplete.error) {
      addToast("Error al completar el turno", "error");
    }
  }, [stateComplete.success, stateComplete.error, addToast]);

  const formatFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(precio);
  };

  const fechaTurno = new Date(turno.horarioReservado);
  const hoy = new Date();
  const isPasado = fechaTurno < hoy;
  const isHoy = fechaTurno.toDateString() === hoy.toDateString();

  const handleComplete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const ok = await confirm({
      title: "Confirmar acción",
      message:
        "¿Estás seguro de marcar este turno como completado? Esta acción no se puede deshacer.",
    });
    if (ok) {
      completeFormRef.current?.requestSubmit();
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const ok = await confirm({
      title: "Cancelar turno",
      message: "¿Estás seguro de cancelar este turno?",
    });
    if (ok) {
      deleteFormRef.current?.requestSubmit();
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${isPasado ? "opacity-75" : ""
          }`}
      >
        {/* Header */}
        <div
          className={`p-4 text-white ${isPasado ? "bg-gray-500" : isHoy ? "bg-green-700" : "bg-[#6fa9da]"
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">
                {isPasado ? "🕐 Pasado" : isHoy ? "📅 Hoy" : "📅 Próximo"}
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
              {turno.vehiculo_servicio.vehiculo.nombre} -{" "}
              {turno.vehiculo_servicio.servicio.nombre}
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

          {/* Acciones */}
          <div className="flex gap-2 pt-3">
            {/* Botón Completar (solo admin y turno pasado) */}
            {session?.user.role === "ADMIN" && isPasado && (
              <form
                ref={completeFormRef}
                action={formActionComplete}
                className="flex-1"
              >
                <input type="hidden" name="id" value={turno.id} />
                <Button
                  onClick={handleComplete}
                  type="submit"
                  variant={"verde"}
                  className="w-full py-2 rounded text-sm font-medium"
                >
                  Completar
                </Button>
              </form>
            )}

            {/* Botón Editar (admin no pasado) o usuario no admin */}
            {session?.user.role === "ADMIN" && !isPasado && (
              <Button
                onClick={() => setShowEditModal(true)}
                variant={"celeste"}
                className="flex-1 py-2 rounded text-sm font-medium"
              >
                Editar
              </Button>
            )}

            {session?.user.role !== "ADMIN" && (
              <Button
                onClick={isPasado ? undefined : () => setShowEditModal(true)}
                variant={isPasado ? "ghost" : "celeste"}
                disabled={isPasado}
                className="flex-1 py-2 rounded text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isPasado ? "Fecha pasada por gestionar" : "Editar"}
              </Button>
            )}

            {/* Botón Cancelar (siempre visible) */}
            <form ref={deleteFormRef} action={formAction}>
              <input type="hidden" name="id" value={turno.id} />
              <Button
                type="submit"
                variant={"rojo"}
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium"
              >
                Cancelar
              </Button>
            </form>
          </div>
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