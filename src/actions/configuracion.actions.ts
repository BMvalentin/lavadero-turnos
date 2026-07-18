"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

export async function obtenerConfiguracion(clave: string) {
    try {
        const config = await prisma.configuracion.findUnique({
            where: { clave },
        });
        return config?.valor || null;
    } catch (error) {
        console.error("Error al obtener configuración:", error);
        return null;
    }
}

export async function actualizarConfiguracion(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const clave = formData.get("clave") as string;
        const valor = formData.get("valor") as string;

        if (!clave || valor === null) {
            return { error: "Clave y valor son requeridos", success: false };
        }

        await prisma.configuracion.upsert({
            where: { clave },
            update: { valor },
            create: { clave, valor },
        });

        revalidatePath("/admin");
        revalidatePath("/turno");

        return { success: true };
    } catch (error) {
        console.error("Error al actualizar configuración:", error);
        return { error: "Error al guardar la configuración", success: false };
    }
}
