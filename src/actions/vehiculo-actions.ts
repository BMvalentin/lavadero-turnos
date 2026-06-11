"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import type { ActionState } from "./types";

export const getVehiculos = async (): Promise<ActionState> => {
  try {
    const vehiculo = await prisma.vehiculo.findMany({
      where: {
        estado: true
      },
      include: {
        vehiculo_servicio: {
          include: {
            servicio: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
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

export const createVehiculo = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const nombre = formData.get("nombre") as string;
    const estadoValue = formData.get("estado");
    const file = formData.get("srcImage") as File | null;

    if (!nombre || nombre.trim() === "") {
      return { error: "El nombre del vehículo es requerido", success: false };
    }

    let secure_url: string | null = null;
    let public_id: string | null = null;

    // Si hay archivo, lo subimos a Cloudinary
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await uploadImage(buffer, {
        folder: "vehiculos",
        public_id: nombre.trim().replace(/\s+/g, "-").toLowerCase(), // SEO: nombre descriptivo
        tags: ["vehiculo", nombre.trim().toLowerCase()],
      });
      secure_url = res.secure_url;
      public_id = res.public_id;
    }

    const estado = estadoValue === "true";

    const nuevoVehiculo = await prisma.vehiculo.create({
      data: {
        id: crypto.randomUUID(),
        nombre: nombre.trim(),
        srcImage: secure_url,
        cloudinaryPublicId: public_id,
        estado,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/vehiculo");
    return { success: true, data: serializeData(nuevoVehiculo) };
  } catch (error) {
    return {
      error: `Error al crear vehículo: ${error instanceof Error ? error.message : "Error desconocido"}`,
      success: false,
    };
  }
};

export const actualizarVehiculo = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const id = formData.get("id") as string;
    const nombre = formData.get("nombre") as string;
    const estadoValue = formData.get("estado");
    const file = formData.get("srcImage") as File | null;

    if (!nombre || nombre.trim() === "") {
      return { error: "El nombre del vehículo es requerido", success: false };
    }

    const vehiculoExistente = await prisma.vehiculo.findUnique({
      where: { id },
    });

    if (!vehiculoExistente) {
      return { error: "Vehículo no encontrado", success: false };
    }

    let secure_url = vehiculoExistente.srcImage;
    let public_id = vehiculoExistente.cloudinaryPublicId;

    // Si se sube una nueva imagen:
    if (file && file.size > 0) {
      // 1. Eliminar imagen anterior de Cloudinary si existía
      if (vehiculoExistente.cloudinaryPublicId) {
        await deleteImage(vehiculoExistente.cloudinaryPublicId).catch(console.error);
      }

      // 2. Subir la nueva
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await uploadImage(buffer, {
        folder: "vehiculos",
        public_id: nombre.trim().replace(/\s+/g, "-").toLowerCase(),
        tags: ["vehiculo", nombre.trim().toLowerCase()],
      });
      secure_url = res.secure_url;
      public_id = res.public_id;
    }

    const estado = estadoValue === "true";

    const vehiculoActualizado = await prisma.vehiculo.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        srcImage: secure_url,
        cloudinaryPublicId: public_id,
        estado,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/vehiculo");
    return { success: true, data: serializeData(vehiculoActualizado) };
  } catch (error) {
    return {
      error: `Error al actualizar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      success: false,
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
          include: {
            turno: true
          }
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