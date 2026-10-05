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

interface UploadOptions {
  folder: string;
  public_id?: string;
  tags?: string[];
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
            width: 1200,
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
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
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
  await cloudinary.uploader.destroy(publicId);
}