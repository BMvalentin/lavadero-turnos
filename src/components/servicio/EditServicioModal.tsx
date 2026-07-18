"use client";

import { actualizarServicio } from "@/actions/servicio-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";
import ImageLoader from "../ui/ImageLoader";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

type Servicio = {
    id: string;
    nombre: string | null;
    srcImage: string | null;
    estado: boolean;
};

type EditServicioModalProps = {
    servicio: Servicio;
    onClose: () => void;
};

export default function EditServicioModal({ servicio, onClose }: EditServicioModalProps) {
    const [state, formAction] = useActionState(actualizarServicio, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            alert("✅ Servicio actualizado exitosamente!");
            onClose();
        }
        if (state.error) {
            alert(`❌ Error: ${state.error}`);
        }
    }, [state.success, state.error, onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Editar Servicio</h2>
                        <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>

                    <form ref={formRef} action={formAction} className="space-y-4">
                        <input type="hidden" name="id" value={servicio.id} />

                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                                Nombre del Servicio *
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                required
                                defaultValue={servicio.nombre || ""}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Imagen del Servicio
                            </label>
                            <ImageLoader name="srcImage" initialImage={servicio.srcImage} />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="estado"
                                name="estado"
                                value="true"
                                defaultChecked={servicio.estado}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="estado" className="ml-2 text-sm font-medium">
                                Servicio activo
                            </label>
                        </div>

                        {state.error && (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-red-600 text-sm">{state.error}</p>
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            <Button type="button" variant={"blanco"} onClick={onClose} className="flex-1">
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
            disabled={pending}
            variant={pending ? "blanco" : "celeste"}
            className="flex-1 disabled:cursor-not-allowed"
        >
            {pending ? "Guardando..." : "Guardar Cambios"}
        </Button>
    );
}