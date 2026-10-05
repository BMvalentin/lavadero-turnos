"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { actualizarSiteConfig } from "@/actions/configuracion.actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { SITE_TEXTO_MAX } from "@/lib/siteConfig";
import type { Seccion } from "./secciones";

const inputClases =
    "w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-celeste outline-none text-sm";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full md:w-auto" variant={pending ? "ghost" : "verde"}>
            {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
    );
}

export default function SiteConfigForm({
    secciones,
    initialValues,
}: {
    secciones: Seccion[];
    initialValues: Record<string, string>;
}) {
    const [state, formAction] = useActionState(actualizarSiteConfig, {});
    const { addToast } = useToast();

    useEffect(() => {
        if (state.success) addToast("Cambios guardados correctamente", "success");
        if (state.error) addToast(state.error, "error");
    }, [state, addToast]);

    return (
        <form action={formAction} className="space-y-6">
            <div className={`grid gap-6 items-start ${secciones.length > 1 ? "xl:grid-cols-2" : ""}`}>
                {secciones.map((seccion) => (
                    <fieldset
                        key={seccion.titulo}
                        className="bg-white p-6 rounded-xl shadow-sm border border-celeste/20 grid gap-4 sm:grid-cols-2"
                    >
                        <div className="sm:col-span-2">
                            <legend className="text-base font-semibold text-gray-800">{seccion.titulo}</legend>
                            <p className="text-xs text-gray-500">{seccion.descripcion}</p>
                        </div>

                        {seccion.campos.map((campo) => (
                            <div
                                key={campo.clave}
                                className={`space-y-1.5 ${campo.multilinea || campo.anchoCompleto ? "sm:col-span-2" : ""}`}
                            >
                                <label htmlFor={campo.clave} className="text-sm font-medium text-gray-700">
                                    {campo.label}
                                </label>
                                {campo.multilinea ? (
                                    <textarea
                                        id={campo.clave}
                                        name={campo.clave}
                                        defaultValue={initialValues[campo.clave]}
                                        required
                                        maxLength={SITE_TEXTO_MAX}
                                        rows={3}
                                        className={`${inputClases} resize-y`}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        id={campo.clave}
                                        name={campo.clave}
                                        defaultValue={initialValues[campo.clave]}
                                        required
                                        maxLength={SITE_TEXTO_MAX}
                                        placeholder={campo.placeholder}
                                        className={inputClases}
                                    />
                                )}
                                {campo.ayuda && <p className="text-xs text-gray-500">{campo.ayuda}</p>}
                            </div>
                        ))}
                    </fieldset>
                ))}
            </div>

            <div className="sticky bottom-4 flex justify-end">
                <SubmitButton />
            </div>
        </form>
    );
}
