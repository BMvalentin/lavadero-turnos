"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { actualizarSiteConfig } from "@/actions/configuracion.actions";
import SeccionApariencia from "@/components/admin/config/SeccionApariencia";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { esColorClaro, esColorHex, mismosColores, type ColoresTema } from "@/lib/tema";

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending || disabled} variant={pending ? "ghost" : "verde"}>
            {pending ? "Guardando..." : "Guardar colores"}
        </Button>
    );
}

export default function AparienciaForm({ initialValues, nombreEmpresa }: { initialValues: ColoresTema; nombreEmpresa: string }) {
    const [state, formAction] = useActionState(actualizarSiteConfig, {});
    const [colores, setColores] = useState(initialValues);
    const { addToast } = useToast();

    useEffect(() => {
        if (state.success) addToast("Colores guardados correctamente", "success");
        if (state.error) addToast(state.error, "error");
    }, [state, addToast]);

    const validos = esColorHex(colores.primario) && esColorClaro(colores.secundario) && esColorClaro(colores.fondo);
    const sinCambios = mismosColores(colores, initialValues);

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="COLOR_PRINCIPAL" value={colores.primario} />
            <input type="hidden" name="COLOR_SECUNDARIO" value={colores.secundario} />
            <input type="hidden" name="COLOR_FONDO" value={colores.fondo} />

            <SeccionApariencia
                colores={colores}
                nombreEmpresa={nombreEmpresa}
                aplicarPlantilla={({ primario, secundario, fondo }) => setColores({ primario, secundario, fondo })}
                cambiarColor={(campo, valor) => setColores((actual) => ({ ...actual, [campo]: valor }))}
            />

            <div className="flex justify-end">
                <SubmitButton disabled={!validos || sinCambios} />
            </div>
        </form>
    );
}
