"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, RotateCcw } from "lucide-react";
import { actualizarSiteConfig } from "@/actions/configuracion.actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { COLOR_PREDETERMINADO, esColorHex, variablesTemaColor } from "@/lib/siteConfig";

const SUGERIDOS = [
    COLOR_PREDETERMINADO,
    "#2563eb",
    "#0d9488",
    "#16a34a",
    "#d97706",
    "#dc2626",
    "#db2777",
    "#7c3aed",
    "#27272a",
];

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending || disabled} variant={pending ? "ghost" : "verde"}>
            {pending ? "Guardando..." : "Guardar color"}
        </Button>
    );
}

export default function ColorForm({ initialValue }: { initialValue: string }) {
    const [state, formAction] = useActionState(actualizarSiteConfig, {});
    const [color, setColor] = useState(initialValue);
    const [texto, setTexto] = useState(initialValue);
    const { addToast } = useToast();

    useEffect(() => {
        if (state.success) addToast("Color guardado correctamente", "success");
        if (state.error) addToast(state.error, "error");
    }, [state, addToast]);

    const elegir = (valor: string) => {
        setColor(valor);
        setTexto(valor);
    };

    // Vista previa: aplica las mismas variables que el layout, sólo dentro de este bloque.
    const previewCss = `#preview-color{${variablesTemaColor(color) ?? ""}}`;
    const esPredeterminado = color.toLowerCase() === COLOR_PREDETERMINADO;

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="COLOR_PRINCIPAL" value={color} />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-celeste/20 space-y-5">
                <div>
                    <h3 className="text-base font-semibold text-gray-800">Color principal</h3>
                    <p className="text-xs text-gray-500">
                        Se aplica a botones, títulos destacados, íconos y detalles de toda la web.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2 items-start">
                    <div className="space-y-5">
                        <div className="flex flex-wrap gap-2">
                            {SUGERIDOS.map((sugerido) => {
                                const activo = sugerido === color.toLowerCase();
                                return (
                                    <button
                                        key={sugerido}
                                        type="button"
                                        onClick={() => elegir(sugerido)}
                                        title={sugerido === COLOR_PREDETERMINADO ? `${sugerido} (predeterminado)` : sugerido}
                                        aria-label={`Usar color ${sugerido}`}
                                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${
                                            activo ? "border-gray-800" : "border-white shadow"
                                        }`}
                                        style={{ backgroundColor: sugerido }}
                                    >
                                        {activo && <Check className="w-4 h-4 text-white drop-shadow" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => elegir(e.target.value)}
                                className="h-10 w-14 cursor-pointer rounded border border-gray-200 bg-white p-1"
                                aria-label="Elegir color personalizado"
                            />
                            <input
                                type="text"
                                value={texto}
                                onChange={(e) => {
                                    const valor = e.target.value.trim();
                                    setTexto(valor);
                                    if (esColorHex(valor)) setColor(valor.toLowerCase());
                                }}
                                maxLength={7}
                                placeholder="#7ebace"
                                className={`w-28 p-2 border rounded-lg bg-gray-50 font-mono text-sm outline-none focus:ring-2 focus:ring-celeste ${
                                    esColorHex(texto) ? "" : "border-red-400"
                                }`}
                                aria-label="Color en hexadecimal"
                            />
                            {!esPredeterminado && (
                                <Button type="button" variant="outline" size="sm" onClick={() => elegir(COLOR_PREDETERMINADO)}>
                                    <RotateCcw className="w-4 h-4 mr-1" /> Predeterminado
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Vista previa */}
                    <div id="preview-color" className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3">
                        <style>{previewCss}</style>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Vista previa</p>
                        <p className="text-2xl font-bold text-gray-800">
                            Sobre <span className="text-celeste-dark">Nosotros</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button type="button" variant="celeste" tabIndex={-1}>Reservar Turno</Button>
                            <Button type="button" variant="outline-celeste" tabIndex={-1}>Ver servicios</Button>
                            <span className="w-10 h-10 rounded-lg bg-celeste/15 flex items-center justify-center">
                                <Check className="w-5 h-5 text-celeste-dark" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <SubmitButton disabled={color === initialValue.toLowerCase()} />
            </div>
        </form>
    );
}
