"use client";

import { create, update } from "@/actions/excepcionesLaborales.actions";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "../ui/button";

type ExcepcionFormProps = {
  excepcion?: {
    id: string;
    motivo: string;
    desde: Date;
    hasta: Date;
    estado: boolean;
  };
  onClose?: () => void;
};

export default function ExcepcionForm({ excepcion, onClose }: ExcepcionFormProps) {
  const [state, formAction] = useActionState(
    excepcion ? update : create,
    { success: false }
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      // Si es modo edición, cerrar después de un breve delay para mostrar el mensaje de éxito
      if (excepcion && onClose) {
        const timer = setTimeout(() => {
          onClose();
        }, 1000); // 1 segundo para ver el mensaje de éxito
        return () => clearTimeout(timer);
      } else {
        // Si es creación, solo resetear el form
        formRef.current?.reset();
      }
    }
  }, [state.success, excepcion, onClose]);

  // Función para formatear fecha para input datetime-local
  const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {excepcion && (
        <input type="hidden" name="id" value={excepcion.id} />
      )}

      <div>
        <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo
        </label>
        <input
          type="text"
          id="motivo"
          name="motivo"
          defaultValue={excepcion?.motivo}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ej: Feriado nacional, Vacaciones, etc."
        />
      </div>

      <div>
        <label htmlFor="desde" className="block text-sm font-medium text-gray-700 mb-1">
          Desde
        </label>
        <input
          type="datetime-local"
          id="desde"
          name="desde"
          defaultValue={excepcion ? formatDateForInput(excepcion.desde) : ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="hasta" className="block text-sm font-medium text-gray-700 mb-1">
          Hasta
        </label>
        <input
          type="datetime-local"
          id="hasta"
          name="hasta"
          defaultValue={excepcion ? formatDateForInput(excepcion.hasta) : ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {excepcion ? 'Excepción actualizada correctamente' : 'Excepción creada correctamente'}
        </div>
      )}

      <Button
        type="submit"
        variant={"celeste"}
        className="w-full  py-2 px-4 rounded-md font-medium"
      >
        {excepcion ? 'Actualizar Excepción' : 'Crear Excepción'}
      </Button>
    </form>
  );
}