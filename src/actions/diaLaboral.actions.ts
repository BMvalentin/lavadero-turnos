"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  success: boolean;
  data?: any;
  error?: string;
};

// Crear día laboral
export async function create(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const dia = parseInt(formData.get("dia") as string);
    const estado = formData.get("estado") === "true";

    // Verificar si ya existe
    const existing = await prisma.dia_laboral.findFirst({
      where: { dia },
    });

    if (existing) {
      return {
        success: false,
        error: "Ya existe un registro para este día de la semana",
      };
    }

    const diaLaboral = await prisma.dia_laboral.create({
      data: {
        dia,
        estado,
      },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: diaLaboral,
    };
  } catch (error) {
    console.error("Error al crear día laboral:", error);
    return {
      success: false,
      error: "Error al crear el día laboral",
    };
  }
}

// Actualizar día laboral
export async function update(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const id = formData.get("id") as string;
    const dia = parseInt(formData.get("dia") as string);
    const estado = formData.get("estado") === "true";

    // Verificar si existe
    const existing = await prisma.dia_laboral.findUnique({
      where: { id },
    });


    // Verificar conflictos con otros días
    const conflict = await prisma.dia_laboral.findFirst({
      where: {
        dia,
        id: { not: id },
      },
    });

    if (conflict) {
      return {
        success: false,
        error: "Ya existe un registro para este día de la semana",
      };
    }

    const diaLaboral = await prisma.dia_laboral.update({
      where: { id },
      data: {
        dia,
        estado,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: diaLaboral,
    };
  } catch (error) {
    console.error("Error al actualizar día laboral:", error);
    return {
      success: false,
      error: "Error al actualizar el día laboral",
    };
  }
}

// Eliminar día laboral
export async function deleteDiaLaboral(id: string): Promise<ActionState> {
  try {

    // Verificar si existe y tiene márgenes
    const existing = await prisma.dia_laboral.findUnique({
      where: { id },
      include: {
        margenes: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Día laboral no encontrado",
      };
    }

    if (existing.margenes.length > 0) {
      return {
        success: false,
        error: "No se puede eliminar. El día tiene márgenes asociados",
      };
    }

    await prisma.dia_laboral.delete({
      where: { id },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: { message: "Día laboral eliminado correctamente" },
    };
  } catch (error) {
    console.error("Error al eliminar día laboral:", error);
    return {
      success: false,
      error: "Error al eliminar el día laboral",
    };
  }
}

// Obtener todos los días laborales
export async function getDiasLaborales() {
  try {
    const diasLaborales = await prisma.dia_laboral.findMany({
      include: {
        margenes: true,
      },
      orderBy: {
        dia: "asc",
      },
    });

    return diasLaborales;
  } catch (error) {
    console.error("Error al obtener días laborales:", error);
    throw new Error("Error al obtener los días laborales");
  }
}

// Obtener un día laboral por ID
export async function getDiaLaboralById(id: string) {
  try {
    const diaLaboral = await prisma.dia_laboral.findUnique({
      where: { id },
      include: {
        margenes: true,
      },
    });

    return diaLaboral;
  } catch (error) {
    console.error("Error al obtener día laboral:", error);
    throw new Error("Error al obtener el día laboral");
  }
}