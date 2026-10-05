import type { SiteTextKey } from "@/lib/siteConfig";

export type Campo = {
    clave: SiteTextKey;
    label: string;
    ayuda?: string;
    placeholder?: string;
    multilinea?: boolean;
    /** Ocupa todo el ancho de la tarjeta (los multilínea siempre lo hacen). */
    anchoCompleto?: boolean;
};

export type Seccion = { titulo: string; descripcion: string; campos: Campo[] };

export const SECCIONES_GENERAL: Seccion[] = [
    {
        titulo: "Empresa",
        descripcion: "Se muestra en el encabezado, el pie de página y el título de la pestaña.",
        campos: [
            {
                clave: "NOMBRE_EMPRESA",
                label: "Nombre de la empresa",
                ayuda: "En el encabezado, la última palabra se resalta en color.",
                anchoCompleto: true,
            },
        ],
    },
    {
        titulo: "Portada",
        descripcion: "Textos principales de la página de inicio.",
        campos: [
            { clave: "HERO_TITULO", label: "Título" },
            { clave: "HERO_TITULO_DESTACADO", label: "Palabra destacada del título" },
            { clave: "HERO_DESCRIPCION", label: "Descripción", multilinea: true },
        ],
    },
    {
        titulo: "Sobre nosotros",
        descripcion: "Texto de la sección \"Sobre Nosotros\".",
        campos: [
            { clave: "NOSOTROS_PARRAFO_1", label: "Primer párrafo", multilinea: true },
            { clave: "NOSOTROS_PARRAFO_2", label: "Segundo párrafo", multilinea: true },
        ],
    },
    {
        titulo: "Pie de página",
        descripcion: "Texto que acompaña al logo en el pie de página.",
        campos: [{ clave: "FOOTER_DESCRIPCION", label: "Descripción", multilinea: true }],
    },
];

export const SECCIONES_UBICACION: Seccion[] = [
    {
        titulo: "Ubicación y contacto",
        descripcion: "Dónde está el lavadero y cómo comunicarse.",
        campos: [
            {
                clave: "DIRECCION",
                label: "Dirección",
                ayuda: "Se usa en la sección de ubicación, el mapa y el pie de página. Incluí la localidad para que el mapa la encuentre (ej: Av. Montreal 1118, Santa Clara del Mar).",
                anchoCompleto: true,
            },
            {
                clave: "TELEFONO",
                label: "Teléfono / WhatsApp",
                ayuda: "Se muestra en la web y es el número al que los clientes escriben por WhatsApp al pedir, modificar o cancelar un turno. Usá un celular con WhatsApp, con código de país y de área, sin el 0 ni el 15.",
                placeholder: "+54 9 223 439-8429",
                anchoCompleto: true,
            },
        ],
    },
];
