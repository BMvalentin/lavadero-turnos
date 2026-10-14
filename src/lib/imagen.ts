export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// Firmas (primeros bytes) de los formatos de foto que aceptamos. El tipo MIME
// lo declara el navegador y se puede falsificar, así que miramos el contenido.
// SVG queda afuera a propósito: puede llevar scripts embebidos.
function esFormatoPermitido(b: Uint8Array): boolean {
    const ascii = (desde: number, hasta: number) => String.fromCharCode(...b.slice(desde, hasta));

    const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    const png = b[0] === 0x89 && ascii(1, 4) === "PNG";
    const gif = ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a";
    const webp = ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
    const avif = ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12));

    return jpeg || png || gif || webp || avif;
}

// Devuelve un mensaje de error para mostrar, o null si la imagen es válida.
export async function validarImagen(archivo: File): Promise<string | null> {
    if (archivo.size > MAX_IMAGE_SIZE_BYTES) {
        return "La imagen supera el tamaño permitido (5 MB).";
    }

    const cabecera = new Uint8Array(await archivo.slice(0, 16).arrayBuffer());
    if (!archivo.type.startsWith("image/") || !esFormatoPermitido(cabecera)) {
        return "El formato de imagen no es válido. Usá JPG, PNG, GIF, WebP o AVIF.";
    }

    return null;
}
