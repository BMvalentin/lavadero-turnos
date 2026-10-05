"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import Image from "next/image";
import { Check, ImageUp, Loader2, RotateCcw, Undo2 } from "lucide-react";
import { guardarImagenesSitio, type ActionState } from "@/actions/configuracion.actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { BANNERS_PREDEFINIDOS, LOGO_PREDETERMINADO } from "@/lib/siteConfig";

type Tipo = "logo" | "banner";

// Cambio elegido pero todavía no guardado.
type Pendiente = { archivo: File; preview: string } | { url: string } | null;

const MAX_BYTES = 5 * 1024 * 1024;

// Botón para elegir un archivo. No sube nada: sólo lo deja pendiente.
function ElegirArchivo({
    label,
    disabled,
    onElegir,
}: {
    label: string;
    disabled: boolean;
    onElegir: (archivo: File) => void;
}) {
    return (
        <label
            className={`inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors ${
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-celeste hover:bg-celeste/10"
            }`}
        >
            <ImageUp className="w-4 h-4" />
            {label}
            <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={disabled}
                onChange={(e) => {
                    const archivo = e.target.files?.[0];
                    if (archivo) onElegir(archivo);
                    e.target.value = "";
                }}
            />
        </label>
    );
}

function BadgePendiente() {
    return (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            Sin guardar
        </span>
    );
}

export default function SiteImagesForm({ logoUrl, bannerUrl }: { logoUrl: string; bannerUrl: string }) {
    const [state, formAction, guardando] = useActionState<ActionState, FormData>(guardarImagenesSitio, {});
    const [logo, setLogo] = useState<Pendiente>(null);
    const [banner, setBanner] = useState<Pendiente>(null);
    const { addToast } = useToast();
    const ultimoState = useRef(state);

    const hayCambios = logo !== null || banner !== null;

    // Libera las URLs de vista previa de archivos locales.
    useEffect(() => {
        const url = logo && "preview" in logo ? logo.preview : null;
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [logo]);
    useEffect(() => {
        const url = banner && "preview" in banner ? banner.preview : null;
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [banner]);

    useEffect(() => {
        if (state === ultimoState.current) return;
        ultimoState.current = state;
        if (state.success) {
            addToast("Imágenes guardadas correctamente", "success");
            setLogo(null);
            setBanner(null);
        }
        if (state.error) addToast(state.error, "error");
    }, [state, addToast]);

    // Avisa si se intenta salir con cambios sin guardar.
    useEffect(() => {
        if (!hayCambios) return;
        const handler = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [hayCambios]);

    const elegirArchivo = (tipo: Tipo, archivo: File) => {
        if (!archivo.type.startsWith("image/")) return addToast("El formato de imagen no es válido.", "error");
        if (archivo.size > MAX_BYTES) return addToast("La imagen supera el tamaño permitido (5 MB).", "error");
        const pendiente = { archivo, preview: URL.createObjectURL(archivo) };
        if (tipo === "logo") setLogo(pendiente);
        else setBanner(pendiente);
    };

    const guardar = () => {
        const fd = new FormData();
        for (const [tipo, pendiente] of [["logo", logo], ["banner", banner]] as const) {
            if (!pendiente) continue;
            if ("archivo" in pendiente) fd.set(`${tipo}_archivo`, pendiente.archivo);
            else fd.set(`${tipo}_predefinida`, pendiente.url);
        }
        startTransition(() => formAction(fd));
    };

    const descartar = () => {
        setLogo(null);
        setBanner(null);
    };

    // Lo que se ve: el cambio pendiente o, si no hay, lo guardado.
    const logoVisible = logo ? ("preview" in logo ? logo.preview : logo.url) : logoUrl;
    const bannerSeleccionado = banner && "url" in banner ? banner.url : banner ? null : bannerUrl;

    const bannerPropioGuardado = !BANNERS_PREDEFINIDOS.some((b) => b.url === bannerUrl);
    const logoPropio = logoUrl !== LOGO_PREDETERMINADO;
    // El banner propio se muestra mientras no se haya elegido otro.
    const mostrarBannerPropio = bannerPropioGuardado && banner === null;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3 items-start">
                {/* Logo */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-celeste/20 space-y-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-800">Logo</h3>
                            {logo && <BadgePendiente />}
                        </div>
                        <p className="text-xs text-gray-500">
                            Se muestra en el encabezado, el pie de página, el login y como ícono de la pestaña.
                            Recomendado: imagen cuadrada en PNG con fondo transparente (máx. 5 MB).
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-start gap-4">
                        <div
                            className={`w-24 h-24 shrink-0 rounded-xl border bg-gray-50 flex items-center justify-center p-2 ${
                                logo ? "border-amber-300 ring-2 ring-amber-200" : "border-gray-200"
                            }`}
                        >
                            <Image
                                src={logoVisible}
                                alt="Logo"
                                width={80}
                                height={80}
                                unoptimized={logoVisible.startsWith("blob:")}
                                className="max-h-full w-auto object-contain"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <ElegirArchivo
                                label="Elegir logo"
                                disabled={guardando}
                                onElegir={(archivo) => elegirArchivo("logo", archivo)}
                            />
                            {logoPropio && !(logo && "url" in logo) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={guardando}
                                    onClick={() => setLogo({ url: LOGO_PREDETERMINADO })}
                                    className="h-auto py-2"
                                >
                                    <RotateCcw className="w-4 h-4 mr-1" /> Usar logo predeterminado
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Banner */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-celeste/20 space-y-4 lg:col-span-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-800">Banner de inicio</h3>
                            {banner && <BadgePendiente />}
                        </div>
                        <p className="text-xs text-gray-500">
                            Imagen de fondo de la portada. Elegí uno de los banners incluidos o subí uno propio
                            (horizontal, idealmente 1920×1080, máx. 5 MB).
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {BANNERS_PREDEFINIDOS.map((b) => {
                            const activo = b.url === bannerSeleccionado;
                            const esGuardado = b.url === bannerUrl;
                            return (
                                <button
                                    key={b.url}
                                    type="button"
                                    disabled={guardando}
                                    // Volver a elegir el guardado descarta el cambio pendiente.
                                    onClick={() => setBanner(esGuardado ? null : { url: b.url })}
                                    className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                                        activo ? "border-celeste ring-2 ring-celeste/40" : "border-transparent hover:border-gray-300"
                                    } ${guardando ? "cursor-wait" : "cursor-pointer"}`}
                                >
                                    <Image src={b.url} alt={b.nombre} fill className="object-cover" sizes="250px" />
                                    <span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-left text-xs text-white">
                                        {b.nombre}
                                    </span>
                                    {activo && (
                                        <span className="absolute top-1.5 right-1.5 rounded-full bg-celeste p-1 text-white">
                                            <Check className="w-3 h-3" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}

                        {mostrarBannerPropio && (
                            <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-celeste ring-2 ring-celeste/40">
                                <Image src={bannerUrl} alt="Banner propio" fill className="object-cover" sizes="250px" />
                                <span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white">Propio</span>
                                <span className="absolute top-1.5 right-1.5 rounded-full bg-celeste p-1 text-white">
                                    <Check className="w-3 h-3" />
                                </span>
                            </div>
                        )}

                        {banner && "preview" in banner && (
                            <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-celeste ring-2 ring-celeste/40">
                                <Image src={banner.preview} alt="Banner nuevo" fill unoptimized className="object-cover" />
                                <span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white">Nuevo</span>
                                <span className="absolute top-1.5 right-1.5 rounded-full bg-celeste p-1 text-white">
                                    <Check className="w-3 h-3" />
                                </span>
                            </div>
                        )}
                    </div>

                    <ElegirArchivo
                        label={bannerPropioGuardado ? "Reemplazar banner propio" : "Subir banner propio"}
                        disabled={guardando}
                        onElegir={(archivo) => elegirArchivo("banner", archivo)}
                    />
                    {bannerPropioGuardado && (
                        <p className="text-xs text-gray-500">
                            Si guardás otro banner, el banner propio actual se elimina.
                        </p>
                    )}
                </div>
            </div>

            <div className="sticky bottom-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                {hayCambios && !guardando && (
                    <p className="text-xs text-amber-700 sm:mr-auto">Tenés cambios sin guardar.</p>
                )}
                {hayCambios && (
                    <Button type="button" variant="outline" disabled={guardando} onClick={descartar}>
                        <Undo2 className="w-4 h-4 mr-1" /> Descartar
                    </Button>
                )}
                <Button
                    type="button"
                    onClick={guardar}
                    disabled={!hayCambios || guardando}
                    variant={guardando ? "ghost" : "verde"}
                    className="w-full sm:w-auto"
                >
                    {guardando ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Guardando...
                        </>
                    ) : (
                        "Guardar cambios"
                    )}
                </Button>
            </div>
        </div>
    );
}
