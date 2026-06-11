"use client";

import { actualizarTurno } from "@/actions/turno.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import SeleccionadorHorario from "./SeleccionadorHorario";
import { Button } from "../ui/button";
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
    user: {
        id: string;
        name: string | null;
        email: string | null;
    };
    vehiculo_servicio: {
        id: string;
        vehiculo: {
            nombre: string | null;
        };
        servicio: {
            nombre: string | null;
        };
    };
};

type EditTurnoModalProps = {
    session: any;
    turno: Turno;
    onClose: () => void;
};

export default function EditTurnoModal({ session, turno, onClose }: EditTurnoModalProps) {
    const [state, formAction] = useActionState(actualizarTurno, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const { addToast } = useToast();

    useEffect(() => {
        if (state.success) {
            addToast("✅ Turno actualizado exitosamente", "success");
            onClose();
        }
        if (state.error) {
            addToast(`❌ Error: ${state.error}`, "error");
        }
    }, [state.success, state.error, onClose]);

    /**
     * CORRECCIÓN DE HORA LOCAL (UTC-3):
     * Usamos métodos locales para que el string resultante sea "YYYY-MM-DDTHH:mm"
     * respetando la zona horaria del navegador (Argentina).
     */
    const formatDateForInput = (date: Date | string) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        // Retorna el formato exacto que esperan los inputs de fecha/hora: 2024-10-25T08:00
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Editar Turno</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                        {/* Info del cliente y servicio... */}
                        <p className="text-xs text-gray-500 uppercase">Cliente</p>
                        <p className="font-semibold">{turno.user.name}</p>
                        <p className="text-xs text-gray-500 uppercase mt-2">Servicio</p>
                        <p className="font-semibold">
                            {turno.vehiculo_servicio.vehiculo.nombre} - {turno.vehiculo_servicio.servicio.nombre}
                        </p>
                    </div>

                    <form ref={formRef} action={formAction} className="space-y-4">
                        <input type="hidden" name="id" value={turno.id} />

                        {/* SOLUCIÓN: 
                           1. Usamos new Date() para evitar el error de "not a function".
                           2. Usamos nuestra función local para evitar el salto de +3hs del UTC.
                        */}
                        <SeleccionadorHorario 
                            name="horarioReservado"
                            vehiculoServicioId={turno.vehiculo_servicio.id}
                            turnoIdAExcluir={turno?.id}
                            defaultValue={formatDateForInput(turno.horarioReservado)}
                        />

                        <div>
                            <label htmlFor="patente" className="block text-sm font-medium mb-1">
                                Patente *
                            </label>
                            <input
                                type="text"
                                id="patente"
                                name="patente"
                                required
                                maxLength={10}
                                defaultValue={turno.patente}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                            />
                        </div>

                        {state.error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-red-600 text-sm">{state.error}</p>
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant={"rojo"} onClick={onClose} className="flex-1 px-4 py-2">
                                Cancelar
                            </Button>
                            <SubmitButton />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            variant={pending ? "ghost" : "celeste"}
            disabled={pending}
            className="flex-1 px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {pending ? "Guardando..." : "Guardar Cambios"}
        </Button>
    );
}