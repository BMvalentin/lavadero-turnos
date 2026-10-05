"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeData } from "@/lib/utils";
import {
  uploadImage,
  deleteImage,
  CloudinaryError,
  getUserFriendlyCloudinaryMessage,
} from "@/lib/cloudinary";

export type ActionState = {
  error?: string;
  success?: boolean;
  data?: any;
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type ImageValidation = { ok: true } | { ok: false; error: string };

function validateImageFile(file: File): ImageValidation {
  if (!file.type || !file.type.startsWith("image/")) {
    return { ok: false, error: "El formato de imagen no es válido." };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, error: "La imagen supera el tamaño permitido (5 MB)." };
  }
  return { ok: true };
}

type ServicioErrorContext = {
  operacion: string;
  servicioId?: string;
  archivo?: { nombre: string; tipo: string; tamano: number };
};

// Log seguro: nunca volcamos el objeto de error crudo de Cloudinary
// (request_options/query_params pueden contener credenciales) ni secretos.
function logServicioError(context: ServicioErrorContext, error: unknown): void {
  console.error(`[servicio-actions] Error en ${context.operacion}`, {
    operacion: context.operacion,
    servicioId: context.servicioId,
    archivo: context.archivo,
    error: error instanceof Error ? error.message : error,
    httpCode: error instanceof CloudinaryError ? error.httpCode : undefined,
    stack: error instanceof Error ? error.stack : undefined,
  });
}

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
  const nombre = formData.get("nombre") as string;
  const estadoValue = formData.get("estado");
  const file = formData.get("srcImage") as File | null;

  if (!nombre || nombre.trim() === "") {
    return { error: "El nombre del servicio es requerido", success: false };
  }

  const nuevaImagen = file && file.size > 0 ? file : null;
  const tieneImagen = nuevaImagen !== null;
  const archivo = nuevaImagen
    ? { nombre: nuevaImagen.name, tipo: nuevaImagen.type, tamano: nuevaImagen.size }
    : undefined;

  let secure_url: string | null = null;
  let public_id: string | null = null;

  if (nuevaImagen) {
    const validation = validateImageFile(nuevaImagen);
    if (!validation.ok) {
      return { error: validation.error, success: false };
    }

    try {
      const buffer = Buffer.from(await nuevaImagen.arrayBuffer());
      const res = await uploadImage(buffer, {
        folder: "servicios",
        public_id: nombre.trim().replace(/\s+/g, "-").toLowerCase(),
        tags: ["servicio", nombre.trim().toLowerCase()],
      });
      secure_url = res.secure_url;
      public_id = res.public_id;
    } catch (error) {
      logServicioError({ operacion: "upload-image", archivo }, error);
      return { error: getUserFriendlyCloudinaryMessage(error), success: false };
    }
  }

  const estado = estadoValue === "true";

  try {
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
    logServicioError({ operacion: "create-servicio" }, error);

    // Si ya habíamos subido una imagen, la borramos para no dejar huérfanos.
    if (tieneImagen && public_id) {
      try {
        await deleteImage(public_id);
      } catch (cleanupError) {
        logServicioError({ operacion: "cleanup-orphan-image" }, cleanupError);
      }
    }

    return {
      error: tieneImagen
        ? "No se pudo crear el servicio después de subir la imagen."
        : "No se pudo crear el servicio.",
      success: false,
    };
  }
};

export const actualizarServicio = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const id = formData.get("id") as string;
  const nombre = formData.get("nombre") as string;
  const estadoValue = formData.get("estado");
  const file = formData.get("srcImage") as File | null;

  if (!nombre || nombre.trim() === "") {
    return { error: "El nombre del servicio es requerido", success: false };
  }

  let servicioExistente: {
    id: string;
    nombre: string | null;
    srcImage: string | null;
    cloudinaryPublicId: string | null;
  } | null;

  try {
    servicioExistente = await prisma.servicio.findUnique({ where: { id } });
  } catch (error) {
    logServicioError({ operacion: "find-servicio", servicioId: id }, error);
    return {
      error: "No se pudo consultar el servicio en la base de datos.",
      success: false,
    };
  }

  if (!servicioExistente) {
    return { error: "Servicio no encontrado", success: false };
  }

  const nuevaImagen = file && file.size > 0 ? file : null;
  const tieneImagen = nuevaImagen !== null;
  const archivo = nuevaImagen
    ? { nombre: nuevaImagen.name, tipo: nuevaImagen.type, tamano: nuevaImagen.size }
    : undefined;

  let secure_url = servicioExistente.srcImage;
  let public_id = servicioExistente.cloudinaryPublicId;
  const publicIdAnterior = servicioExistente.cloudinaryPublicId;

  // 1. Subir primero la nueva imagen (si la hay). NO borramos la anterior todavía.
  if (nuevaImagen) {
    const validation = validateImageFile(nuevaImagen);
    if (!validation.ok) {
      return { error: validation.error, success: false };
    }

    try {
      const buffer = Buffer.from(await nuevaImagen.arrayBuffer());
      const res = await uploadImage(buffer, {
        folder: "servicios",
        public_id: nombre.trim().replace(/\s+/g, "-").toLowerCase(),
        tags: ["servicio", nombre.trim().toLowerCase()],
      });
      secure_url = res.secure_url;
      public_id = res.public_id;
    } catch (error) {
      logServicioError(
        { operacion: "upload-image", servicioId: id, archivo },
        error
      );
      return { error: getUserFriendlyCloudinaryMessage(error), success: false };
    }
  }

  const estado = estadoValue === "true";

  // 2. Actualizar la base de datos.
  let servicioActualizado;
  try {
    servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        srcImage: secure_url,
        cloudinaryPublicId: public_id,
        estado,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logServicioError(
      { operacion: "update-servicio", servicioId: id, archivo },
      error
    );

    // Si subimos una imagen nueva y falló el guardado, la borramos para no
    // dejarla huérfana en Cloudinary. La imagen anterior sigue intacta.
    if (tieneImagen && public_id && public_id !== publicIdAnterior) {
      try {
        await deleteImage(public_id);
      } catch (cleanupError) {
        logServicioError(
          { operacion: "cleanup-orphan-image", servicioId: id },
          cleanupError
        );
      }
    }

    return {
      error: tieneImagen
        ? "No se pudo actualizar el servicio después de subir la imagen."
        : "No se pudo actualizar el servicio.",
      success: false,
    };
  }

  // 3. Recién ahora borramos la imagen anterior (best-effort, sólo se registra).
  if (
    tieneImagen &&
    publicIdAnterior &&
    publicIdAnterior !== public_id
  ) {
    try {
      await deleteImage(publicIdAnterior);
    } catch (error) {
      logServicioError(
        { operacion: "delete-previous-image", servicioId: id },
        error
      );
    }
  }

  revalidatePath("/servicio");
  return { success: true, data: serializeData(servicioActualizado) };
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