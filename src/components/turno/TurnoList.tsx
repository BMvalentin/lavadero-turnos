"use client";

import { useMemo } from "react";
import TurnoCard from "./TurnoCard"; // Importamos el componente separado

export default function TurnoList({ session, turnos }: { session: any; turnos: any[] }) {
  if (!Array.isArray(turnos)) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: datos inválidos</p>
      </div>
    );
  }

  const { turnosHoy, turnosRestantes } = useMemo(() => {
    const hoy = new Date().toDateString();
    const hoyList: any[] = [];
    const restoList: any[] = [];

    turnos.forEach((t) => {
      const fechaTurno = new Date(t.horarioReservado).toDateString();
      if (fechaTurno === hoy) hoyList.push(t);
      else restoList.push(t);
    });

    hoyList.sort((a, b) => new Date(a.horarioReservado).getTime() - new Date(b.horarioReservado).getTime());
    restoList.sort((a, b) => new Date(b.horarioReservado).getTime() - new Date(a.horarioReservado).getTime());

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
            {turnosHoy.map((turno) => <TurnoCard session={session} key={turno.id} turno={turno} />)}
          </div>
        ) : (
          <p className="text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-dashed text-sm">No hay turnos hoy.</p>
        )}
      </section>

      <hr className="border-gray-200" />

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Otros Turnos</h2>
        {turnosRestantes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turnosRestantes.map((turno) => <TurnoCard session={session} key={turno.id} turno={turno} />)}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay más turnos en el sistema.</p>
        )}
      </section>
    </div>
  );
}