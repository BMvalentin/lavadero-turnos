"use client";

import { createServicio } from "@/actions/servicio-actions";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";
import ImageLoader from "../ui/ImageLoader";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

export default function CreateServicioForm() {
    const [state, formAction] = useActionState(createServicio, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            alert("Servicio creado exitosamente");
        }
    }, [state.success]);

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Servicio</h2>
            
            <form ref={formRef} action={formAction} className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                        Nombre del Servicio *
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Lavado completo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Imagen del Servicio
                    </label>
                    <ImageLoader name="srcImage" />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="estado"
                        name="estado"
                        value="true"
                        defaultChecked
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

                <SubmitButton />
            </form>
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
            className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {pending ? "Creando..." : "Crear Servicio"}
        </Button>
    );
}