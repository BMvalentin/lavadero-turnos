"use client";

import { useState, useTransition } from "react";
import { actualizarOpcionSitio } from "@/actions/configuracion.actions";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/useToast";
import { opcionActiva, type SiteFlagKey } from "@/lib/siteConfig";

type Opcion = {
    clave: SiteFlagKey;
    titulo: string;
    descripcionActiva: string;
    descripcionInactiva: string;
    mensajeActiva: string;
    mensajeInactiva: string;
};

const OPCIONES: Opcion[] = [
    {
        clave: "TURNOS_HABILITADOS",
        titulo: "Reserva de turnos",
        descripcionActiva: "Los clientes pueden reservar turnos desde la web.",
        descripcionInactiva:
            "La reserva de turnos está bloqueada: los clientes no pueden crear turnos nuevos hasta que la vuelvas a activar. Desde el panel podés seguir cargando turnos a mano.",
        mensajeActiva: "Reserva de turnos activada",
        mensajeInactiva: "Reserva de turnos desactivada",
    },
    {
        clave: "MOSTRAR_PRECIOS",
        titulo: "Mostrar precios",
        descripcionActiva: "Se muestra y se carga el precio de cada servicio: en la web, en los turnos, en los correos y en los formularios del panel.",
        descripcionInactiva:
            "Los precios están ocultos en toda la web, incluidos los formularios del panel (precio, descuento y seña). Los servicios nuevos se guardan sin precio y los existentes conservan el que tenían.",
        mensajeActiva: "Los precios ahora son visibles",
        mensajeInactiva: "Los precios ahora están ocultos",
    },
];

function FilaOpcion({ opcion, valorInicial }: { opcion: Opcion; valorInicial: boolean }) {
    const [activa, setActiva] = useState(valorInicial);
    const [pending, startTransition] = useTransition();
    const { addToast } = useToast();

    const cambiar = (nuevo: boolean) => {
        setActiva(nuevo);
        startTransition(async () => {
            const res = await actualizarOpcionSitio(opcion.clave, nuevo);
            if (res.success) {
                addToast(nuevo ? opcion.mensajeActiva : opcion.mensajeInactiva, "success");
            } else {
                setActiva(!nuevo);
                addToast(res.error || "No se pudo guardar", "error");
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-celeste/20 flex items-start justify-between gap-6">
            <div className="space-y-1">
                <label htmlFor={opcion.clave} className="text-base font-semibold text-gray-800 cursor-pointer">
                    {opcion.titulo}
                </label>
                <p className={`text-sm ${activa ? "text-gray-500" : "text-amber-700"}`}>
                    {activa ? opcion.descripcionActiva : opcion.descripcionInactiva}
                </p>
            </div>
            <Switch
                id={opcion.clave}
                checked={activa}
                disabled={pending}
                onCheckedChange={cambiar}
                className="mt-1"
                aria-label={opcion.titulo}
            />
        </div>
    );
}

export default function OpcionesTurnosForm({ valores }: { valores: Record<SiteFlagKey, string> }) {
    return (
        <div className="grid gap-6 xl:grid-cols-2 items-start">
            {OPCIONES.map((opcion) => (
                <FilaOpcion key={opcion.clave} opcion={opcion} valorInicial={opcionActiva(valores[opcion.clave])} />
            ))}
        </div>
    );
}
