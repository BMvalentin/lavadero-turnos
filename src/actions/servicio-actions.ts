"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import type { ActionState } from "./types";

export const getServicios = async (): Promise<ActionState> => {
  try {
    const servicio = await prisma.servicio.findMany({
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
      data: serializeData(servicio)
    };

  } catch (error) {
    return {
      error: "Error al obtener los servicios",
      success: false
    }
  }
};

export const createServicio = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const nombre = formData.get("nombre") as string;
    const estadoValue = formData.get("estado");
    const file = formData.get("srcImage") as File | null;

    if (!nombre || nombre.trim() === "") {
      return { error: "El nombre del servicio es requerido", success: false };
    }

    let secure_url: string | null = null;
    let public_id: string | null = null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await uploadImage(buffer, {
        folder: "servicios",
        public_id: nombre.trim().replace(/\s+/g, "-").toLowerCase(),
        tags: ["servicio", nombre.trim().toLowerCase()],
      });
      secure_url = res.secure_url;
      public_id = res.public_id;
    }

    const estado = estadoValue === "true";

    const nuevoServicio = await prisma.servicio.create({
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

    revalidatePath("/servicio");
    return { success: true, data: serializeData(nuevoServicio) };
  } catch (error) {
    return {
      error: `Error al crear servicio: ${error instanceof Error ? error.message : "Error desconocido"}`,
      success: false,
    };
  }
};

export const actualizarServicio = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  try {
    const id = formData.get("id") as string;
    const nombre = formData.get("nombre") as string;
    const estadoValue = formData.get("estado");
    const file = formData.get("srcImage") as File | null;

    if (!nombre || nombre.trim() === "") {
      return { error: "El nombre del servicio es requerido", success: false };
    }

    const servicioExistente = await prisma.servicio.findUnique({
      where: { id },
    });

    if (!servicioExistente) {
      return { error: "Servicio no encontrado", success: false };
    }

    let secure_url = servicioExistente.srcImage;
    let public_id = servicioExistente.cloudinaryPublicId;

    if (file && file.size > 0) {
      if (servicioExistente.cloudinaryPublicId) {
        await deleteImage(servicioExistente.cloudinaryPublicId).catch(console.error);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await uploadImage(buffer, {
        folder: "servicios",
        public_id: nombre.trim().replace(/\s+/g, "-").toLowerCase(),
        tags: ["servicio", nombre.trim().toLowerCase()],
      });
      secure_url = res.secure_url;
      public_id = res.public_id;
    }

    const estado = estadoValue === "true";

    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        srcImage: secure_url,
        cloudinaryPublicId: public_id,
        estado,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/servicio");
    return { success: true, data: serializeData(servicioActualizado) };
  } catch (error) {
    return {
      error: `Error al actualizar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      success: false,
    };
  }
};

export const deleteservicio = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
  try {
    const id = formData.get('id') as string;
    console.log("ID a eliminar:", id);

    const servicioExistente = await prisma.servicio.findUnique({
      where: { id },
      include: {
        vehiculo_servicio: {
          include: {
            turno: true
          }
        }
      }
    });

    if (!servicioExistente) {
      return {
        error: "Servicio no encontrado",
        success: false
      };
    }

    const tieneTurnos = servicioExistente.vehiculo_servicio.some(
      (vs: { turno: any[] }) => vs.turno.length > 0
    );

    if (tieneTurnos) {
      return {
        error: "No se puede eliminar: tiene turnos asociados",
        success: false
      }
    }

    await prisma.servicio.update({
      where: { id },
      data: {
        estado: false,
        updatedAt: new Date()
      }
    });
    revalidatePath('/servicio');

    return {
      success: true,
      data: { id }
    };

  } catch (error) {
    return {
      error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      success: false
    };
  }
};

export const getVehiculosConServicios = async (): Promise<ActionState> => {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      where: {
        estado: true,
      },
      include: {
        vehiculo_servicio: {
          where: {
            estado: true,
          },
          include: {
            servicio: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convertimos Decimal antes de retornar par que nextjs no tenga problemas al serializar los datos de Prisma
    const vehiculosSerializados = serializeData(vehiculos);

    return {
      success: true,
      data: vehiculosSerializados,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error al obtener los vehículos y servicios",
      success: false,
    };
  }
};