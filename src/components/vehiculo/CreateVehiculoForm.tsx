"use client";

import { createVehiculo } from "@/actions/vehiculo-actions";
import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

export default function CreateVehiculoForm() {
    const [state, formAction] = useActionState(createVehiculo, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Limpiar preview cuando se resetea el formulario (tras éxito)
    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
        }
    }, [state.success]); // eslint-disable-line react-hooks/exhaustive-deps

    // Manejar cambio de archivo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Tipo de Vehículo</h2>
            
            <form ref={formRef} action={formAction} encType="multipart/form-data" className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                        Nombre del Vehículo *
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Auto, Camioneta, Moto"
                    />
                </div>

                <div>
                    <label htmlFor="srcImage" className="block text-sm font-medium mb-1">
                        Imagen del vehículo
                    </label>
                    <input
                        type="file"
                        id="srcImage"
                        name="srcImage"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {previewUrl && (
                        <div className="mt-2">
                            <img src={previewUrl} alt="Vista previa" className="h-32 w-auto rounded border" />
                        </div>
                    )}
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
                        Vehículo activo
                    </label>
                </div>

                {state.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-red-600 text-sm">{state.error}</p>
                    </div>
                )}

                {state.success && (
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-green-600 text-sm">
                            ✅ Vehículo creado correctamente
                        </p>
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
            variant={pending? "blanco":"celeste"}
            disabled={pending}
            className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {pending ? "Creando..." : "Crear Vehículo"}
        </Button>
    );
}