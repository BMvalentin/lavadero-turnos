"use client";

import { useActionState } from "react";
import { actualizarConfiguracion } from "@/actions/configuracion.actions";
import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { useEffect } from "react";

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button 
            type="submit" 
            disabled={pending}
            className="w-full md:w-auto"
            variant={pending ? "ghost" : "verde"}
        >
            {pending ? "Guardando..." : "Guardar Configuración"}
        </Button>
    );
}

export default function ConfigForm({ initialValue }: { initialValue: string }) {
    const [state, formAction] = useActionState(actualizarConfiguracion, initialState);

    useEffect(() => {
        if (state.success) {
            alert("✅ Configuración guardada correctamente");
        }
        if (state.error) {
            alert(`❌ Error: ${state.error}`);
        }
    }, [state.success, state.error]);

    return (
        <form action={formAction} className="space-y-4 max-w-md bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <input type="hidden" name="clave" value="WHATSAPP_OWNER_NUMBER" />
            
            <div className="space-y-2">
                <label htmlFor="valor" className="text-sm font-medium text-gray-700">
                    Número de WhatsApp (Ej: 5491123456789)
                </label>
                <input 
                    type="text" 
                    id="valor" 
                    name="valor" 
                    defaultValue={initialValue}
                    placeholder="5491100000000"
                    required
                    className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <p className="text-xs text-gray-500">
                    Ingresa el número con el código de país (ej. 54 para Argentina) seguido del código de área sin el 0 y el número sin el 15.
                </p>
            </div>

            <div className="pt-2">
                <SubmitButton />
            </div>
        </form>
    );
}
