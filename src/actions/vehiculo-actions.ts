"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

function cleanImageUrl(url: string | null): string | null {
    if (!url || url.trim() === '') return null;
    let cleaned = url.trim();

    if (cleaned.startsWith('data:image')) {
        console.warn('⚠️ Imagen base64 detectada, no se guardará directamente.');
        return null;
    }
    if (cleaned.includes('public\\') || cleaned.includes('public/')) {
        cleaned = cleaned.replace(/^.*public[\\\/]/, '/');
    }
    if (cleaned.match(/^[A-Za-z]:\\/)) {
        console.warn('⚠️ Ruta de Windows detectada, no se guardará:', cleaned);
        return null;
    }
    if (!cleaned.startsWith('http') && !cleaned.startsWith('/')) {
        cleaned = '/' + cleaned;
    }
    cleaned = cleaned.replace(/\\/g, '/');
    return cleaned;
}

async function uploadToCloudinary(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

  try {
    const uploadRes = await cloudinary.uploader.upload(base64Image, {
      folder: "lavadero/vehiculos",
    });
    return uploadRes.secure_url;
  } catch (error) {
    console.error("Error subiendo imagen de vehículo a Cloudinary:", error);
    throw new Error("No se pudo subir la imagen a Cloudinary");
  }
}

export const getVehiculos = async (): Promise<ActionState> => {
    try {
        const vehiculo = await prisma.vehiculo.findMany({
            where: { estado: true },
            include: {
                vehiculo_servicio: {
                    include: { servicio: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            data: serializeData(vehiculo)
        };

    } catch (error) {
        return {
            error: "Error al obtener los vehículos",
            success: false
        }
    }
};

export const createVehiculo = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {    
    try {
        const nombre = formData.get('nombre') as string;
        const estadoValue = formData.get('estado');
        const imageEntry = formData.get('srcImage');

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del vehículo es requerido",
                success: false
            };
        }

        let finalImageUrl: string | null = null;

        if (imageEntry instanceof File && imageEntry.size > 0) {
            finalImageUrl = await uploadToCloudinary(imageEntry);
        } 
        else if (typeof imageEntry === 'string') {
            finalImageUrl = cleanImageUrl(imageEntry);
        }

        const estado = estadoValue === 'true';

        const nuevoVehiculo = await prisma.vehiculo.create({
            data: {
                id: crypto.randomUUID(),
                nombre: nombre.trim(),
                srcImage: finalImageUrl,
                estado: estado,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath('/vehiculo');
        
        return {
            success: true,
            data: serializeData(nuevoVehiculo)
        };
    } catch (error) {
        return {
            error: "Error al crear el vehículo. Intente nuevamente",
            success: false
        };
    }
};

export const actualizarVehiculo = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    try {
        const id = formData.get('id') as string;
        const nombre = formData.get('nombre') as string;
        const estadoValue = formData.get('estado');
        const imageEntry = formData.get('srcImage');

        if (!nombre || nombre.trim() === '') {
            return {
                error: "El nombre del vehículo es requerido",
                success: false
            };
        }

        const existe = await prisma.vehiculo.findUnique({
            where: { id }
        });

        if (!existe) {
            return {
                error: "Vehículo no encontrado",
                success: false
            };
        }

        let finalImageUrl = existe.srcImage;

        if (imageEntry instanceof File && imageEntry.size > 0) {
            finalImageUrl = await uploadToCloudinary(imageEntry);
        } 
        else if (typeof imageEntry === 'string' && imageEntry.trim() !== '') {
            finalImageUrl = cleanImageUrl(imageEntry);
        }

        const estado = estadoValue === 'true';

        const vehiculoActualizado = await prisma.vehiculo.update({
            where: { id },
            data: {
                nombre: nombre.trim(),
                srcImage: finalImageUrl,
                estado: estado,
                updatedAt: new Date()
            }
        });

        revalidatePath('/vehiculo');
        
        return {
            success: true,
            data: serializeData(vehiculoActualizado)
        };
    } catch (error) {
        return {
            error: `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            success: false
        };
    }
};

export const deleteVehiculo = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {    
    try {
        const id = formData.get('id') as string;
        
        const vehiculoExistente = await prisma.vehiculo.findUnique({
            where: { id },
            include: {
                vehiculo_servicio: {
                    include: { turno: true }
                }
            }
        });

        if (!vehiculoExistente) {
            return {
                error: "Vehículo no encontrado",
                success: false
            };
        }

        const tieneTurnos = vehiculoExistente.vehiculo_servicio.some(
            (vs: { turno: any[] }) => vs.turno.length > 0
        );

        if (tieneTurnos) {
            return {
                error: "No se puede eliminar: tiene turnos asociados",
                success: false
            }
        }

        await prisma.vehiculo.update({
            where: { id },
            data: {
                estado: false,
                updatedAt: new Date()
            }
        });
        
        revalidatePath('/vehiculo');
        
        return {
            success: true,
            data: { id }
        };

    } catch (error) {
        return {
            error: "Error al dar de baja el vehículo",
            success: false
        };
    }
};