import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

// Configuración desde variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder: string;             // obligatorio, ej: "vehiculos"
  public_id?: string;         // nombre amigable sin extensión
  tags?: string[];            // para SEO y organización
}

export async function uploadImage(
  fileBuffer: Buffer,
  options: UploadOptions
): Promise<{ secure_url: string; public_id: string }> {
  // 1. Comprimir y convertir a webp
  const optimizedBuffer = await sharp(fileBuffer)
    .resize({ width: 1200, withoutEnlargement: true }) // máximo 1200px de ancho
    .webp({ quality: 80 })
    .toBuffer();

  // 2. Subir a Cloudinary usando upload_stream (más eficiente)
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.public_id,
        tags: options.tags,
        resource_type: "image",
        format: "webp",
        use_filename: true,          // respeta el public_id provisto
        unique_filename: false,      // no añade sufijos aleatorios si ya existe
        overwrite: true,             // si ya existe, lo reemplaza
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
    uploadStream.end(optimizedBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}