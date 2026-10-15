"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Image as ImageIcon,
    MapPin,
    Palette,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";

const items = [
    { href: "/admin/configuracion/general", label: "Información general", icon: Building2 },
    { href: "/admin/configuracion/ubicacion", label: "Ubicación y contacto", icon: MapPin },
    { href: "/admin/configuracion/apariencia", label: "Apariencia", icon: Palette },
    { href: "/admin/configuracion/imagenes", label: "Imágenes", icon: ImageIcon },
    { href: "/admin/configuracion/feriados", label: "Feriados y excepciones", icon: CalendarDays },
];

const STORAGE_KEY = "configSidebarAbierto";

export default function ConfigSidebar() {
    const pathname = usePathname();
    const [abierto, setAbierto] = useState(true);

    // Recuerda si el panel quedó abierto o cerrado.
    useEffect(() => {
        try {
            if (localStorage.getItem(STORAGE_KEY) === "false") setAbierto(false);
        } catch {}
    }, []);

    const alternar = () => {
        setAbierto((v) => {
            try {
                localStorage.setItem(STORAGE_KEY, String(!v));
            } catch {}
            return !v;
        });
    };

    const IconoToggle = abierto ? PanelLeftClose : PanelLeftOpen;

    return (
        <aside
            className={`w-full md:shrink-0 bg-white border-b md:border-b-0 md:border-r border-celeste/20 text-muted-foreground md:min-h-full transition-[width] duration-200 ${
                abierto ? "md:w-64" : "md:w-16"
            }`}
        >
            <div className="md:sticky md:top-16 p-3 space-y-3">
                <div className={`flex items-center gap-2 ${abierto ? "justify-between" : "justify-between md:flex-col"}`}>
                    <Link
                        href="/admin"
                        title="Volver al panel"
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-celeste/10 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 shrink-0" />
                        <span className={abierto ? "" : "md:sr-only"}>Volver al panel</span>
                    </Link>

                    <button
                        type="button"
                        onClick={alternar}
                        aria-expanded={abierto}
                        aria-label={abierto ? "Cerrar panel" : "Abrir panel"}
                        title={abierto ? "Cerrar panel" : "Abrir panel"}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-celeste/10 hover:text-foreground transition-colors cursor-pointer"
                    >
                        <IconoToggle className="w-4 h-4 max-md:rotate-90" />
                    </button>
                </div>

                <p
                    className={`px-2 text-[11px] font-bold uppercase tracking-wider text-celeste-dark ${
                        abierto ? "" : "hidden"
                    }`}
                >
                    Configuración
                </p>

                {/* En celular, cerrado oculta el listado; en escritorio queda sólo con íconos */}
                <nav className={`space-y-0.5 ${abierto ? "" : "hidden md:block"}`}>
                    {items.map(({ href, label, icon: Icon }) => {
                        const activo = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                title={abierto ? undefined : label}
                                aria-current={activo ? "page" : undefined}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                    abierto ? "" : "md:justify-center md:px-0"
                                } ${
                                    activo
                                        ? "bg-celeste/15 text-celeste-dark font-medium"
                                        : "text-muted-foreground hover:bg-celeste/10 hover:text-foreground"
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className={abierto ? "" : "md:sr-only"}>{label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
