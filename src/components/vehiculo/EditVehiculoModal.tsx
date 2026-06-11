"use client";

import { actualizarVehiculo } from "@/actions/vehiculo-actions";
import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

type Vehiculo = {
    id: string;
    nombre: string | null;
    srcImage: string | null;
    estado: boolean;
};

type EditVehiculoModalProps = {
    vehiculo: Vehiculo;
    onClose: () => void;
};

export default function EditVehiculoModal({ vehiculo, onClose }: EditVehiculoModalProps) {
    const [state, formAction] = useActionState(actualizarVehiculo, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cuando se cierra el modal, limpiar preview
    const handleClose = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        onClose();
    };

    useEffect(() => {
        if (state.success) {
            handleClose();
        }
    }, [state.success]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Editar Vehículo</h2>
                        <Button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>

                    <form ref={formRef} action={formAction} encType="multipart/form-data" className="space-y-4">
                        <input type="hidden" name="id" value={vehiculo.id} />

                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                                Nombre del Vehículo *
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                required
                                defaultValue={vehiculo.nombre || ""}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Auto, Camioneta"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Imagen actual</label>
                            {vehiculo.srcImage ? (
                                <img src={vehiculo.srcImage} alt={vehiculo.nombre || "Vehículo"} className="h-24 w-auto mb-2 rounded" />
                            ) : (
                                <p className="text-gray-500 text-sm mb-2">Sin imagen</p>
                            )}
                            <label htmlFor="srcImage" className="block text-sm font-medium mb-1">
                                Nueva imagen (opcional)
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
                            {previewUrl ? (
                                <div className="mt-2">
                                    <img src={previewUrl} alt="Vista previa nueva" className="h-32 w-auto rounded border" />
                                </div>
                            ) : vehiculo.srcImage ? (
                                <p className="text-xs text-gray-500 mt-1">Si no selecciona archivo, se conserva la actual.</p>
                            ) : null}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="estado"
                                name="estado"
                                value="true"
                                defaultChecked={vehiculo.estado}
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

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                variant={"blanco"}
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
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
            variant={pending? "blanco":"celeste"}
            className="flex-1 disabled:cursor-not-allowed"
        >
            {pending ? "Guardando..." : "Guardar Cambios"}
        </Button>
    );
}