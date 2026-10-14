"use client";

import { useEffect, useState } from "react";
import { obtenerHorariosDisponibles, type SlotHorario } from "@/actions/calendario.actions";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import FechaInput from "../ui/FechaInput";
import { formatValorInput } from "@/lib/fechas";

interface Props {
  vehiculoServicioId?: string;
  turnoIdAExcluir?: string;
  defaultValue?: string; 
  name: string;
}

export default function SeleccionadorHorario({ 
  vehiculoServicioId, 
  turnoIdAExcluir, 
  defaultValue,
  name 
}: Props) {
  const getTodayStr = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  };
  
  const [fecha, setFecha] = useState(defaultValue ? defaultValue.split("T")[0] : getTodayStr());
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [slots, setSlots] = useState<SlotHorario[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    if (defaultValue && defaultValue.includes("T")) {
      // Extraemos la hora para mostrarla en los botones (ej: "08:00")
      const hora = defaultValue.split("T")[1].substring(0, 5);
      setHoraSeleccionada(hora);
    }
  }, [defaultValue]);

  useEffect(() => {
    async function buscar() {
      if (!vehiculoServicioId) {
        setSlots([]);
        return;
      }
      setLoading(true);
      setMensajeError("");
      
      const result = await obtenerHorariosDisponibles(fecha, vehiculoServicioId, turnoIdAExcluir);
      
      setLoading(false);
      if (result.success && result.horarios) {
        setSlots(result.horarios);
        if (result.horarios.length === 0) setMensajeError(result.mensaje || "Sin disponibilidad");
      } else {
        setMensajeError(result.error || "Error");
        setSlots([]);
      }
    }
    buscar();
  }, [fecha, vehiculoServicioId, turnoIdAExcluir]);

  useEffect(() => {
    if (!loading && slots.length > 0 && horaSeleccionada) {
      const existe = slots.find(s => s.hora === horaSeleccionada);
      if (!existe) setHoraSeleccionada("");
    }
  }, [fecha, vehiculoServicioId, slots, loading, horaSeleccionada]);

  const valorInputHidden = (fecha && horaSeleccionada)
    ? `${fecha}T${horaSeleccionada}:00` 
    : "";

  return (
    <div className="bg-gray-50 border rounded-lg p-3 sm:p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Agenda</h3>
        {horaSeleccionada && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {formatValorInput(fecha)} a las {horaSeleccionada} hs
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
           <label className="block text-xs font-medium text-gray-500 mb-1.5">Fecha</label>
           <FechaInput
              className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus-within:ring-2 focus-within:ring-blue-500"
              value={fecha}
              min={getTodayStr()}
              onChange={(valor) => valor && setFecha(valor)}
           />
        </div>

        <div>
           <label className="block text-xs font-medium text-gray-500 mb-1.5">Horarios</label>
           <div className={cn("border rounded-md p-2 bg-white min-h-[120px]", loading && "opacity-50 pointer-events-none")}>
              {!vehiculoServicioId ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs text-center">Seleccione un servicio primero</div>
              ) : loading ? (
                <div className="h-full flex items-center justify-center text-blue-500 text-xs">Cargando...</div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-40 sm:max-h-48 overflow-y-auto pr-1">
                  {slots.map((slot) => (
                    <Button
                      key={slot.hora}
                      type="button"
                      disabled={!slot.disponible}
                      onClick={() => setHoraSeleccionada(slot.hora)}
                      variant="ghost"
                      className={cn(
                        "text-xs h-8 border",
                        horaSeleccionada === slot.hora ? "bg-cyan-600 text-white border-cyan-700" : 
                        slot.disponible ? "bg-white text-gray-700 border-gray-200 hover:border-cyan-300" : "bg-red-50 text-red-300 border-red-50"
                      )}
                    >
                      {slot.hora}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">{mensajeError}</div>
              )}
           </div>
        </div>
      </div>
      
      {/* Input oculto que envía el dato exacto al formulario */}
      <input type="hidden" name={name} value={valorInputHidden} />
    </div>
  );
}