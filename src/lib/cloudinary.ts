// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder: string;
  public_id?: string;
  tags?: string[];
}

export async function uploadImage(
  fileBuffer: Buffer,
  options: UploadOptions
): Promise<{ secure_url: string; public_id: string }> {
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
  await cloudinary.uploader.destroy(publicId);
}