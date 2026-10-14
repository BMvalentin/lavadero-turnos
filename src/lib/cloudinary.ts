// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// La configuración de Cloudinary es server-side: api_key y api_secret
// nunca deben exponerse al navegador.
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

function assertCloudinaryConfig(): void {
  const missing: string[] = [];
  if (!cloudName) missing.push("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  if (!apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!apiSecret) missing.push("CLOUDINARY_API_SECRET");

  if (missing.length === 0) return;

  // Log seguro: sólo nombres de variables, nunca valores ni secretos.
  console.error(
    `[cloudinary] Configuración incompleta. Faltan variables de entorno: ${missing.join(", ")}`
  );

  if (!cloudName) {
    throw new Error("Falta configurar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.");
  }
  throw new Error("La configuración de Cloudinary está incompleta.");
}

export class CloudinaryError extends Error {
  httpCode?: number;

  constructor(message: string, httpCode?: number) {
    super(message);
    this.name = "CloudinaryError";
    this.httpCode = httpCode;
  }
}

// El SDK de Cloudinary rechaza/entrega objetos planos (no instancias de Error)
// con la forma { message, http_code, name } o { error: { message, http_code } }.
// Los normalizamos a un Error real, descartando request_options/query_params,
// que pueden contener credenciales.
export function normalizeCloudinaryError(error: unknown): CloudinaryError {
  if (error instanceof CloudinaryError) return error;

  if (error instanceof Error) {
    const httpCode = (error as { http_code?: unknown }).http_code;
    return new CloudinaryError(
      error.message,
      typeof httpCode === "number" ? httpCode : undefined
    );
  }

  if (error && typeof error === "object") {
    const raw = error as {
      message?: unknown;
      http_code?: unknown;
      error?: unknown;
    };

    const apiError =
      raw.error && typeof raw.error === "object"
        ? (raw.error as { message?: unknown; http_code?: unknown })
        : raw;

    const message =
      typeof apiError.message === "string" && apiError.message.length > 0
        ? apiError.message
        : "Cloudinary devolvió un error sin mensaje.";

    const httpCode =
      typeof apiError.http_code === "number" ? apiError.http_code : undefined;

    return new CloudinaryError(message, httpCode);
  }

  if (typeof error === "string" && error.length > 0) {
    return new CloudinaryError(error);
  }

  return new CloudinaryError("Cloudinary devolvió un error desconocido.");
}

function isCloudinaryConfigErrorMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("cloud_name mismatch") ||
    normalized.includes("invalid signature") ||
    normalized.includes("invalid api_key") ||
    normalized.includes("invalid api key") ||
    normalized.includes("unknown api key") ||
    normalized.includes("cloud_name") ||
    normalized.includes("authorization")
  );
}

// Traduce un error de Cloudinary a un mensaje seguro y útil para el usuario final.
export function getUserFriendlyCloudinaryMessage(error: unknown): string {
  const normalized = normalizeCloudinaryError(error);
  const message = normalized.message.toLowerCase();

  if (
    normalized.httpCode === 401 ||
    normalized.httpCode === 403 ||
    isCloudinaryConfigErrorMessage(normalized.message)
  ) {
    return "No se pudo subir la imagen. Verificá la configuración de Cloudinary.";
  }

  if (
    normalized.httpCode === 413 ||
    message.includes("too large") ||
    message.includes("demasiado grande")
  ) {
    return "La imagen supera el tamaño permitido.";
  }

  if (
    message.includes("invalid image") ||
    message.includes("unsupported") ||
    message.includes("invalid file") ||
    message.includes("not a valid")
  ) {
    return "El formato de imagen no es válido.";
  }

  return "No se pudo procesar la imagen seleccionada.";
}

interface UploadOptions {
  folder: string;
  public_id?: string;
  tags?: string[];
  maxWidth?: number;
}

export async function uploadImage(
  fileBuffer: Buffer,
  options: UploadOptions
): Promise<{ secure_url: string; public_id: string }> {
  assertCloudinaryConfig();
  // No necesitamos sharp: la transformación se hace en la subida
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.public_id,
        tags: options.tags,
        resource_type: "image",
        // ---- Transformaciones aplicadas por Cloudinary ----
        transformation: [
          {
            width: options.maxWidth ?? 1200,
            quality: "auto:good",     // compresión automática buena
            fetch_format: "auto",     // elige el mejor formato (webp, etc.)
            crop: "limit",            // no agranda imágenes más pequeñas
          },
        ],
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(normalizeCloudinaryError(error));
        if (!result) {
          return reject(
            new CloudinaryError("Cloudinary no devolvió resultado en el upload.")
          );
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  assertCloudinaryConfig();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw normalizeCloudinaryError(error);
  }
}