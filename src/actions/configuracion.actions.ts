"use server";

import { esAdmin } from "@/lib/esAdmin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
    BANNERS_PREDEFINIDOS,
    LOGO_PREDETERMINADO,
    SITE_CONFIG_DEFAULTS,
    SITE_CONFIG_KEYS,
    SITE_FORM_KEYS,
    SITE_TEXTO_MAX,
    SITE_TEXT_OPCIONALES,
    esColorHex,
    esEnlaceGoogleMaps,
    extraerCoordenadas,
    numeroWhatsApp,
    type SiteConfig,
    type SiteConfigKey,
    type SiteImageKey,
} from "@/lib/siteConfig";
import { deleteImage, getUserFriendlyCloudinaryMessage, uploadImage } from "@/lib/cloudinary";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

export async function obtenerConfiguracion(clave: string) {
    try {
        const config = await prisma.configuracion.findUnique({
            where: { clave },
        });
        return config?.valor || null;
    } catch (error) {
        console.error("Error al obtener configuración:", error);
        return null;
    }
}

export async function obtenerSiteConfig(): Promise<SiteConfig> {
    const config: SiteConfig = { ...SITE_CONFIG_DEFAULTS };
    try {
        const filas = await prisma.configuracion.findMany({
            where: { clave: { in: SITE_CONFIG_KEYS } },
        });
        for (const fila of filas) {
            if (fila.valor.trim() !== "") {
                config[fila.clave as keyof SiteConfig] = fila.valor;
            }
        }
    } catch (error) {
        console.error("Error al obtener configuración del sitio:", error);
    }
    return config;
}

export async function actualizarSiteConfig(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    if (!(await esAdmin())) {
        return { error: "No autorizado", success: false };
    }

    // Cada sección envía sólo sus campos; se guardan los que vengan en el form.
    const valores: { clave: SiteConfigKey; valor: string }[] = SITE_FORM_KEYS.filter((clave) => formData.has(clave)).map((clave) => ({
        clave,
        valor: String(formData.get(clave) ?? "").trim(),
    }));

    if (valores.length === 0) {
        return { error: "No hay cambios para guardar", success: false };
    }
    if (valores.some((v) => v.valor === "" && !(SITE_TEXT_OPCIONALES as SiteConfigKey[]).includes(v.clave))) {
        return { error: "Todos los campos son obligatorios", success: false };
    }
    if (valores.some((v) => v.valor.length > SITE_TEXTO_MAX)) {
        return { error: `Cada texto puede tener hasta ${SITE_TEXTO_MAX} caracteres`, success: false };
    }
    const color = valores.find((v) => v.clave === "COLOR_PRINCIPAL");
    if (color && !esColorHex(color.valor)) {
        return { error: "El color no es válido", success: false };
    }

    const telefono = valores.find((v) => v.clave === "TELEFONO");
    if (telefono && !/^\d{10,15}$/.test(numeroWhatsApp(telefono.valor))) {
        return { error: "El teléfono debe incluir código de país y de área (ej: +54 9 223 439-8429)", success: false };
    }

    const mapa = valores.find((v) => v.clave === "MAPA_URL");
    if (mapa) {
        const resultado = await procesarEnlaceMapa(mapa.valor);
        if ("error" in resultado) return { error: resultado.error, success: false };
        valores.push({ clave: "MAPA_COORDENADAS", valor: resultado.coordenadas });
    }

    try {
        await prisma.$transaction(
            valores.map(({ clave, valor }) =>
                prisma.configuracion.upsert({
                    where: { clave },
                    update: { valor },
                    create: { clave, valor },
                })
            )
        );

        // Los textos se usan en el layout (header/footer), así que revalidamos todo.
        revalidatePath("/", "layout");

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar configuración del sitio:", error);
        return { error: "Error al guardar la configuración", success: false };
    }
}

// ---------- Mapa ----------

// Acepta un enlace de Google Maps (largo o corto, de "Compartir") o coordenadas
// "lat, lng". Devuelve las coordenadas para mostrar el punto exacto en el mapa
// ("" si el enlace no las incluye: en ese caso el mapa usa la dirección).
async function procesarEnlaceMapa(valor: string): Promise<{ coordenadas: string } | { error: string }> {
    if (valor === "") return { coordenadas: "" };

    const directas = extraerCoordenadas(valor);
    if (directas && !/^https?:/i.test(valor)) return { coordenadas: directas };

    let url: URL;
    try {
        url = new URL(valor);
    } catch {
        return { error: "El enlace del mapa no es válido. Pegá el enlace de Google Maps o las coordenadas (ej: -37.83, -57.50)" };
    }
    if (url.protocol !== "https:" || !esEnlaceGoogleMaps(url)) {
        return { error: "El enlace del mapa debe ser de Google Maps" };
    }
    if (directas) return { coordenadas: directas };

    // Los enlaces cortos (maps.app.goo.gl) no traen coordenadas: seguimos la redirección.
    if (url.hostname === "maps.app.goo.gl" || url.hostname === "goo.gl") {
        try {
            const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(5000) });
            const destino = res.headers.get("location");
            if (destino) {
                const destinoUrl = new URL(destino, url);
                if (esEnlaceGoogleMaps(destinoUrl)) {
                    return { coordenadas: extraerCoordenadas(destinoUrl.toString()) ?? "" };
                }
            }
        } catch (error) {
            console.error("No se pudo resolver el enlace del mapa:", error);
        }
    }
    return { coordenadas: "" };
}

// ---------- Imágenes del sitio (logo y banner) ----------

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const IMAGENES: Record<"logo" | "banner", { clave: SiteImageKey; maxWidth: number; predefinidas: string[] }> = {
    logo: { clave: "LOGO_URL", maxWidth: 512, predefinidas: [LOGO_PREDETERMINADO] },
    banner: { clave: "BANNER_URL", maxWidth: 2400, predefinidas: BANNERS_PREDEFINIDOS.map((b) => b.url) },
};

// Guarda la nueva URL (y su public_id de Cloudinary, si tiene) y recién
// después borra la imagen subida anteriormente, para no dejar huérfanos.
async function guardarImagen(clave: SiteImageKey, url: string, publicId: string | null) {
    const clavePublicId = `${clave}_PUBLIC_ID`;
    const publicIdAnterior = await obtenerConfiguracion(clavePublicId);

    await prisma.$transaction([
        prisma.configuracion.upsert({
            where: { clave },
            update: { valor: url },
            create: { clave, valor: url },
        }),
        prisma.configuracion.upsert({
            where: { clave: clavePublicId },
            update: { valor: publicId ?? "" },
            create: { clave: clavePublicId, valor: publicId ?? "" },
        }),
    ]);

    if (publicIdAnterior && publicIdAnterior !== publicId) {
        try {
            await deleteImage(publicIdAnterior);
        } catch (error) {
            console.error(`[configuracion] No se pudo borrar la imagen anterior de ${clave}:`,
                error instanceof Error ? error.message : error);
        }
    }

    revalidatePath("/", "layout");
}

type ImagenTipo = keyof typeof IMAGENES;

function validarArchivo(archivo: File): string | null {
    if (!archivo.type.startsWith("image/")) return "El formato de imagen no es válido.";
    if (archivo.size > MAX_IMAGE_SIZE_BYTES) return "La imagen supera el tamaño permitido (5 MB).";
    return null;
}

// Sube (si hace falta) y guarda una imagen. Si falla el guardado, borra lo subido.
async function aplicarImagen(tipo: ImagenTipo, cambio: { archivo: File } | { url: string }) {
    const { clave, maxWidth } = IMAGENES[tipo];

    if ("url" in cambio) {
        await guardarImagen(clave, cambio.url, null);
        return;
    }

    let subida: { secure_url: string; public_id: string };
    try {
        const buffer = Buffer.from(await cambio.archivo.arrayBuffer());
        subida = await uploadImage(buffer, { folder: "sitio", tags: ["sitio", tipo], maxWidth });
    } catch (error) {
        console.error(`[configuracion] Error al subir ${tipo}:`, error instanceof Error ? error.message : error);
        throw new Error(getUserFriendlyCloudinaryMessage(error));
    }

    try {
        await guardarImagen(clave, subida.secure_url, subida.public_id);
    } catch (error) {
        console.error(`[configuracion] Error al guardar ${tipo}:`, error);
        try {
            await deleteImage(subida.public_id);
        } catch {
            // best-effort
        }
        throw new Error("No se pudo guardar la imagen");
    }
}

// Guarda los cambios de imágenes confirmados por el admin. Por cada tipo
// (logo/banner) puede venir un archivo nuevo (`<tipo>_archivo`) o la URL de
// una imagen predefinida (`<tipo>_predefinida`).
export async function guardarImagenesSitio(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    if (!(await esAdmin())) {
        return { error: "No autorizado", success: false };
    }

    const cambios: { tipo: ImagenTipo; cambio: { archivo: File } | { url: string } }[] = [];

    for (const tipo of Object.keys(IMAGENES) as ImagenTipo[]) {
        const archivo = formData.get(`${tipo}_archivo`);
        const predefinida = formData.get(`${tipo}_predefinida`);

        if (archivo instanceof File && archivo.size > 0) {
            const error = validarArchivo(archivo);
            if (error) return { error, success: false };
            cambios.push({ tipo, cambio: { archivo } });
        } else if (typeof predefinida === "string" && predefinida !== "") {
            if (!IMAGENES[tipo].predefinidas.includes(predefinida)) {
                return { error: "Imagen inválida", success: false };
            }
            cambios.push({ tipo, cambio: { url: predefinida } });
        }
    }

    if (cambios.length === 0) {
        return { error: "No hay cambios para guardar", success: false };
    }

    for (const { tipo, cambio } of cambios) {
        try {
            await aplicarImagen(tipo, cambio);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : "No se pudo guardar la imagen";
            return { error: `${tipo === "logo" ? "Logo" : "Banner"}: ${mensaje}`, success: false };
        }
    }

    return { success: true };
}
