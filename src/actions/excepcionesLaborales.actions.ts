"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { esAdmin } from "@/lib/esAdmin";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

const NO_AUTORIZADO: ActionState = { error: "No autorizado", success: false };

export async function create(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    if (!(await esAdmin())) return NO_AUTORIZADO;

    try {
        const excepcion = await prisma.expeciones_laborales.create({
            data: {
                id: crypto.randomUUID(),
                motivo: formData.get("motivo") as string,
                desde: new Date(formData.get("desde") as string),
                hasta: new Date(formData.get("hasta") as string),
                estado: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        revalidatePath("/admin/configuracion/feriados");
        return {
            success: true,
            data: excepcion
        };
    } catch (error) {
        console.error("Error al crear excepción:", error);
        return {
            error: "Error al crear la excepción laboral",
            success: false
        };
    }
}

export async function getExcepciones(): Promise<ActionState> {
    if (!(await esAdmin())) return NO_AUTORIZADO;

    try {
        const excepciones = await prisma.expeciones_laborales.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: excepciones
        }
    } catch (error) {
        console.error("Error al obtener excepciones:", error);
        return {
            error: "Error al obtener las excepciones laborales",
            success: false
        }
    }
}

export async function update(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    if (!(await esAdmin())) return NO_AUTORIZADO;

    try {
        const id = formData.get("id") as string;

        const excepcion = await prisma.expeciones_laborales.update({
            where: { id },
            data: {
                motivo: formData.get("motivo") as string,
                desde: new Date(formData.get("desde") as string),
                hasta: new Date(formData.get("hasta") as string),
                updatedAt: new Date()
            }
        });

        revalidatePath("/admin/configuracion/feriados");
        return {
            success: true,
            data: excepcion};
    } catch (error) {
        console.error("Error al actualizar excepción:", error);
        return {
            error: "Error al actualizar la excepción laboral",
            success: false
        };
    }
}

// cambiar estado a false en lugar de eliminar
export async function softDeleteExcepcion(id: string): Promise<ActionState> {
    if (!(await esAdmin())) return NO_AUTORIZADO;

    try {
       
        const excepcion = await prisma.expeciones_laborales.update({
            where: { id },
            data: {
                estado: false,
                updatedAt: new Date()
            }
        });

        revalidatePath("/admin/configuracion/feriados");
        return {
            success: true,
            data: excepcion
        };
    } catch (error) {
        console.error("Error al desactivar excepción:", error);
        return {
            error: "Error al desactivar la excepción laboral",
            success: false
        };
    }
}

export async function deleteExcepcion(id: string): Promise<ActionState> {
    if (!(await esAdmin())) return NO_AUTORIZADO;

    try {
        if (!id) {
            return {
                error: "ID de excepción no proporcionado",
                success: false
            };
        }

        await prisma.expeciones_laborales.delete({
            where: { id }
        });

        revalidatePath("/admin/configuracion/feriados");
        return {
            success: true,
            data: { id }
        };
    } catch (error) {
        console.error("Error al eliminar excepción:", error);
        return {
            error: "Error al eliminar la excepción laboral",
            success: false
        };
    }
}
