"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { esAdmin } from "@/lib/esAdmin";
import { serializeData } from "@/lib/utils";
import { vehiculoServicioSchema } from "@/lib/zod";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

const NO_AUTORIZADO: ActionState = { error: "No autorizado", success: false };

export async function createVehiculoXServicio(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    if (!(await esAdmin())) return NO_AUTORIZADO;

    
    try {
        const id_vehiculo = formData.get("id_vehiculo");
        const id_servicio = formData.get("id_servicio");
        const duracionMinutos = formData.get("duracionMinutos");
        const precio = formData.get("precio");
        const descuento = formData.get("descuento");
        const senia = formData.get("senia");

        // Validaciones
        if (!id_vehiculo || !id_servicio) {
            return {
                error: "Vehículo y servicio son requeridos",
                success: false
            };
        }

        if (!duracionMinutos || !precio) {
            return {
                error: "Duración y precio son requeridos",
                success: false
            };
        }

        const montos = vehiculoServicioSchema.safeParse({
            duracion: duracionMinutos,
            precio,
            descuento: descuento || 0,
            senia: senia || 0,
        });
        if (!montos.success) {
            return { error: montos.error.issues[0].message, success: false };
        }

        const data = {
            id: crypto.randomUUID(),
            vehiculoId: String(id_vehiculo),
            servicioId: String(id_servicio),
            ...montos.data,
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const vehiculoServicio = await prisma.vehiculo_servicio.create({ data });

        revalidatePath("/vehiculoXServicio");

        return {
            success: true,
            data: serializeData(vehiculoServicio)
        };

    } catch (error) {
        console.error("No se pudo crear la configuración:", error);
        return {
            error: "No se pudo crear la configuración",
            success: false
        };
    }
}

export async function actualizarVehiculoXServicio(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    if (!(await esAdmin())) return NO_AUTORIZADO;

  
    try {
        const id = formData.get("id");
        const vehiculoId = String(formData.get("id_vehiculo"));
        const servicioId = String(formData.get("id_servicio"));
        
        if (!id) return { error: "ID no proporcionado", success: false };

        const montos = vehiculoServicioSchema.safeParse({
            duracion: formData.get("duracionMinutos"),
            precio: formData.get("precio"),
            descuento: formData.get("descuento") || 0,
            senia: formData.get("senia") || 0,
        });
        if (!montos.success) {
            return { error: montos.error.issues[0].message, success: false };
        }

        // 1. VALIDACIÓN DE DUPLICADOS:
        // Buscamos si existe OTRO registro con la misma combinación pero distinto ID
        const duplicado = await prisma.vehiculo_servicio.findFirst({
            where: {
                vehiculoId: vehiculoId,
                servicioId: servicioId,
                estado: true, // Solo nos importan los que están activos
                NOT: {
                    id: String(id) // Excluimos el registro actual que estamos editando
                }
            },
            include: {
                vehiculo: true,
                servicio: true
            }
        });

        if (duplicado) {
            return {
                success: false,
                error: `Ya existe una configuración para "${duplicado.vehiculo.nombre}" con el servicio "${duplicado.servicio.nombre}".`
            };
        }

        // 2. Preparar datos para actualización
        const data = {
            vehiculoId,
            servicioId,
            ...montos.data,
            updatedAt: new Date()
        };

        const existe = await prisma.vehiculo_servicio.findUnique({
            where: { id: String(id) }
        });

        if (!existe) return { error: "Configuración no encontrada", success: false };

        const vehiculoXServicio = await prisma.vehiculo_servicio.update({
            where: { id: String(id) }, 
            data
        });

        revalidatePath("/vehiculoXServicio");

        return {
            success: true,
            data: serializeData(vehiculoXServicio)
        };

    } catch (error) {
        console.error("No se pudo actualizar la configuración:", error);
        return {
            error: "No se pudo actualizar la configuración",
            success: false
        };
    }
}

export async function deleteVehiculoXServicio(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {    
    if (!(await esAdmin())) return NO_AUTORIZADO;

    try {
        const id = formData.get("id");
      
        const existe = await prisma.vehiculo_servicio.findUnique({
            where: { id: String(id) },
            include: {
                turno: true
            }
        });

        if (!existe) {
            return {
                error: "Vehículo x Servicio no encontrado",
                success: false
            };
        }

        // Verificar si tiene turnos asociados
        if (existe.turno.length > 0) {
            return {
                error: "No se puede eliminar: tiene turnos asociados",
                success: false
            };
        }

        await prisma.vehiculo_servicio.update({
            where: { id: String(id) },
            data: {
                estado: false,
                updatedAt: new Date()
            }
        });

        revalidatePath("/vehiculoXServicio");

        return {
            success: true,
            data: { id }
        };

    } catch (error) {
        console.error("No se pudo eliminar la configuración:", error);
        return {
            error: "No se pudo eliminar la configuración",
            success: false
        };
    }
}

// FUNCIÓN CORRECTA: Para obtener las CONFIGURACIONES (vehículo x servicio)
export async function obtenerVehiculosXServicios(params?: {
    search?: string;
    orderBy?: "vehiculo" | "servicio" | "precio" | "createdAt";
    orderDir?: "asc" | "desc";
}): Promise<ActionState> {
    try {
        const where = params?.search
            ? {
                estado: true,
                OR: [
                    {
                        vehiculo: {
                            nombre: {
                                contains: params.search,
                            }
                        }
                    },
                    {
                        servicio: {
                            nombre: {
                                contains: params.search,
                            }
                        }
                    }
                ]
            }
            : { estado: true };

        const vehiculosXServicios = await prisma.vehiculo_servicio.findMany({
            where,
            orderBy: params?.orderBy
                ? params.orderBy === "vehiculo" || params.orderBy === "servicio"
                    ? { [params.orderBy]: { nombre: params.orderDir ?? "asc" } }
                    : { [params.orderBy]: params.orderDir ?? "asc" }
                : { createdAt: "desc" },
            include: {
                vehiculo: {
                    select: {
                        id: true,
                        nombre: true,
                        srcImage: true
                    }
                },
                servicio: {
                    select: {
                        id: true,
                        nombre: true,
                        srcImage: true
                    }
                }
            }
        });
        return {
            success: true,
            data: serializeData(vehiculosXServicios)  // ← ARRAY de configuraciones
        };
    } catch (error) {
        return {
            error: "Error al obtener las configuraciones",
            success: false
        };
    }
}

// FUNCIÓN PARA DROPDOWNS: Para obtener listas de vehículos y servicios
export async function obtenerVehiculosYServicios(): Promise<ActionState> {
    try {
        const [vehiculos, servicios] = await Promise.all([
            prisma.vehiculo.findMany({
                where: { estado: true },
                select: { id: true, nombre: true },
                orderBy: { nombre: 'asc' }
            }),
            prisma.servicio.findMany({
                where: { estado: true },
                select: { id: true, nombre: true },
                orderBy: { nombre: 'asc' }
            })
        ]);

        return {
            success: true,
            data: { vehiculos, servicios }  // ← OBJETO con dos arrays
        };
    } catch (error) {
        return {
            error: "Error al obtener vehículos y servicios",
            success: false
        };
    }
}

export async function obtenerCatalogosParaModalVXS() {
    try {
        const [vehiculos, servicios] = await Promise.all([
            prisma.vehiculo.findMany({ where: { estado: true } }),
            prisma.servicio.findMany({ where: { estado: true } })
        ]);

        return {
            success: true,
            data: {
                vehiculos: serializeData(vehiculos),
                servicios: serializeData(servicios)
            }
        };
    } catch (error) {
        return { success: false, error: "Error al cargar catálogos" };
    }
}