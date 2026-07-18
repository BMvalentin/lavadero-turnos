"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { addMinutes } from "date-fns";
import { serializeData } from "@/lib/utils";
import { enviarCorreoCreacionTurno, enviarCorreoModificacionTurno, enviarCorreoCancelacionTurno, TurnoDetails } from "@/lib/mail";
import { obtenerConfiguracion } from "./configuracion.actions";

const TIMEZONE = process.env.TIMEZONE || "America/Argentina/Buenos_Aires";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

async function getWhatsAppUrl(tipo: "solicitar" | "modificar" | "cancelar", detalles: TurnoDetails) {
    const ownerNumber = await obtenerConfiguracion("WHATSAPP_OWNER_NUMBER");
    if (!ownerNumber) return null;

    const texto = `Hola, acabo de ${tipo} un turno.
*Detalle del turno:*
- Cliente: ${detalles.cliente}
- Servicio: ${detalles.servicio}
- Fecha: ${detalles.fecha}
- Vehículo: ${detalles.vehiculo}`;

    return `https://wa.me/${ownerNumber}?text=${encodeURIComponent(texto)}`;
}

// Auxiliares zonificados
function getMinutesFromZonedDate(date: Date): number {
    const zoned = toZonedTime(date, TIMEZONE);
    return zoned.getHours() * 60 + zoned.getMinutes();
}

function timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

export async function createTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const vehiculoServicioId = formData.get("vehiculoServicioId") as string;
        const userId = formData.get("userId") as string;
        const horarioReservadoStr = formData.get("horarioReservado") as string;
        const patente = formData.get("patente") as string;

        if (!vehiculoServicioId || !userId || !horarioReservadoStr || !patente) {
            return { error: "Todos los campos son requeridos", success: false };
        }

        // --- Lógica de Desfase :) ---
        const fechaSolicitadaInicio = fromZonedTime(horarioReservadoStr, TIMEZONE);
        const ahoraUTC = new Date();

        if (fechaSolicitadaInicio <= addMinutes(ahoraUTC, 10)) {
            return { error: "Reserva con al menos 10 min de antelación.", success: false };
        }

        const vehiculoServicio = await prisma.vehiculo_servicio.findUnique({
            where: { id: vehiculoServicioId },
            select: { duracion: true, precio: true, senia: true }
        });

        if (!vehiculoServicio) return { error: "Servicio no encontrado", success: false };

        if (!vehiculoServicioId || !userId || !horarioReservadoStr || !patente) {
            return { error: "Todos los campos son requeridos", success: false };
        }

        const fechaSolicitadaFin = addMinutes(fechaSolicitadaInicio, vehiculoServicio.duracion);

        // Rango del día en Argentina para buscar colisiones
        const fechaSoloString = horarioReservadoStr.split('T')[0]; // "2026-01-31"
        const inicioDia = fromZonedTime(`${fechaSoloString} 00:00:00`, TIMEZONE);
        const finDia = fromZonedTime(`${fechaSoloString} 23:59:59`, TIMEZONE);

        const diaSemanaIndex = toZonedTime(fechaSolicitadaInicio, TIMEZONE).getDay();

        const [diaLaboralConfig, excepciones, turnosDelDia] = await Promise.all([
            prisma.dia_laboral.findFirst({
                where: { dia: diaSemanaIndex, estado: true },
                include: { margenes: { where: { estado: true } } }
            }),
            prisma.expeciones_laborales.findMany({
                where: {
                    estado: true,
                    desde: { lte: fechaSolicitadaFin },
                    hasta: { gte: fechaSolicitadaInicio }
                }
            }),
            prisma.turno.findMany({
                where: {
                    estado: 1,
                    horarioReservado: { gte: inicioDia, lte: finDia }
                },
                include: { vehiculo_servicio: { select: { duracion: true } } }
            })
        ]);

        if (excepciones.length > 0) {
            return { error: `No disponible: ${excepciones[0].motivo}`, success: false };
        }

        if (!diaLaboralConfig) {
            return { error: "Cerrado este día.", success: false };
        }

        // Validar márgenes usando minutos locales
        const minutosInicio = getMinutesFromZonedDate(fechaSolicitadaInicio);
        const minutosFin = minutosInicio + vehiculoServicio.duracion;

        const entraEnMargen = diaLaboralConfig.margenes.some((m) => {
            return minutosInicio >= timeToMinutes(m.desde) && minutosFin <= timeToMinutes(m.hasta);
        });

        if (!entraEnMargen) {
            return { error: "Horario fuera de la jornada laboral.", success: false };
        }

        // Validar choque con otros turnos
        const hayChoque = turnosDelDia.some((t) => {
            const tInicio = t.horarioReservado;
            const tFin = addMinutes(tInicio, t.vehiculo_servicio.duracion);
            return (fechaSolicitadaInicio < tFin && fechaSolicitadaFin > tInicio);
        });

        if (hayChoque) return { error: "El horario ya está ocupado.", success: false };

        const nuevoTurno = await prisma.turno.create({
            data: {
                id: crypto.randomUUID(),
                vehiculoServicioId,
                userId,
                horarioReservado: fechaSolicitadaInicio,
                precioCongelado: vehiculoServicio.precio,
                seniaCongelada: vehiculoServicio.senia,
                patente: patente.toUpperCase(),
                estado: 1,
                // CAMPOS OBLIGATORIOS
                createdAt: ahoraUTC,
                updatedAt: ahoraUTC,
            }
        });

        let whatsappUrl = null;
        let turnoDetalles = null;

        // Notificación por correo
        try {
            const turnoParaCorreo = await prisma.turno.findUnique({
                where: { id: nuevoTurno.id },
                include: {
                    user: true,
                    vehiculo_servicio: {
                        include: { vehiculo: true, servicio: true }
                    }
                }
            });

            if (turnoParaCorreo && turnoParaCorreo.user.email) {
                turnoDetalles = {
                    cliente: turnoParaCorreo.user.name || turnoParaCorreo.user.email,
                    fecha: formatInTimeZone(turnoParaCorreo.horarioReservado, TIMEZONE, "dd/MM/yyyy HH:mm"),
                    vehiculo: turnoParaCorreo.vehiculo_servicio.vehiculo.nombre || "Vehículo",
                    servicio: turnoParaCorreo.vehiculo_servicio.servicio.nombre || "Servicio",
                    precio: Number(turnoParaCorreo.precioCongelado)
                };
                await enviarCorreoCreacionTurno(turnoParaCorreo.user.email, turnoDetalles);
            }
        } catch (mailError) {
            console.error("[WPP] Error al enviar correo de creación:", mailError);
        }

        // Generación del link de WhatsApp (independiente del correo)
        try {
            if (turnoDetalles) {
                whatsappUrl = await getWhatsAppUrl("solicitar", turnoDetalles);
                console.log("[WPP] URL generada:", whatsappUrl);
            } else {
                console.warn("[WPP] No se pudieron obtener los detalles del turno para WhatsApp");
            }
        } catch (wppError) {
            console.error("[WPP] Error al generar URL de WhatsApp:", wppError);
        }

        revalidatePath("/turno");
        return { success: true, data: { id: nuevoTurno.id, whatsappUrl } };

    } catch (error) {
        console.error(error);
        return { error: "Error al crear el turno", success: false };
    }
}

export async function getTurnos(params?: { userId?: string; fecha?: string }): Promise<ActionState> {
    try {
        let where: any = { estado: 1 };
        if (params?.userId) where.userId = params.userId;

        if (params?.fecha) {
            // fecha viene como "YYYY-MM-DD"
            const inicio = fromZonedTime(`${params.fecha} 00:00:00`, TIMEZONE);
            const fin = fromZonedTime(`${params.fecha} 23:59:59`, TIMEZONE);
            where.horarioReservado = { gte: inicio, lte: fin };
        }

        const turnos = await prisma.turno.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                vehiculo_servicio: {
                    include: {
                        vehiculo: { select: { nombre: true } },
                        servicio: { select: { nombre: true } }
                    }
                }
            },
            orderBy: { horarioReservado: 'asc' }
        });

        const serializedTurnos = serializeData(turnos);

        return {
            success: true,
            data: serializedTurnos.map(t => ({
                ...t,
                // Ahora sí forzamos a que el string devuelto tenga la hora de Argentina
                horarioReservado: formatInTimeZone(t.horarioReservado, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss")
            }))
        };
    } catch (error) {
        return { error: "Error al obtener turnos", success: false };
    }
}

export async function actualizarTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    try {
        const id = formData.get("id") as string;
        const horarioReservadoStr = formData.get("horarioReservado") as string; // Viene "YYYY-MM-DDTHH:mm"
        const patente = formData.get("patente") as string;

        if (!id) return { error: "ID no proporcionado", success: false };

        // 1. Obtener el turno actual
        const turnoActual = await prisma.turno.findUnique({
            where: { id },
            include: { vehiculo_servicio: true }
        });

        if (!turnoActual) return { error: "Turno no encontrado", success: false };

        // 2. Manejo de fecha con Zona Horaria
        // Si viene un string nuevo, lo interpretamos como Argentina. Si no, mantenemos el Date de la DB.
        const fechaSolicitadaInicio = horarioReservadoStr
            ? fromZonedTime(horarioReservadoStr, TIMEZONE)
            : turnoActual.horarioReservado;

        const duracion = turnoActual.vehiculo_servicio.duracion;
        const fechaSolicitadaFin = addMinutes(fechaSolicitadaInicio, duracion);
        const ahoraUTC = new Date();

        // 3. Validación de fecha pasada (solo si cambió el horario)
        if (horarioReservadoStr) {
            if (fechaSolicitadaInicio < ahoraUTC) {
                return { error: "No puedes mover un turno a una fecha/hora pasada.", success: false };
            }
        }

        // 4. Obtener contexto para validaciones (Márgenes y Choques)
        // Extraemos solo la parte "YYYY-MM-DD" para definir el rango del día
        const fechaSoloString = toZonedTime(fechaSolicitadaInicio, TIMEZONE).toISOString().split('T')[0];
        const inicioDia = fromZonedTime(`${fechaSoloString} 00:00:00`, TIMEZONE);
        const finDia = fromZonedTime(`${fechaSoloString} 23:59:59`, TIMEZONE);
        const diaSemanaIndex = toZonedTime(fechaSolicitadaInicio, TIMEZONE).getDay();

        const [diaLaboralConfig, excepciones, turnosDelDia] = await Promise.all([
            prisma.dia_laboral.findFirst({
                where: { dia: diaSemanaIndex, estado: true },
                include: { margenes: { where: { estado: true } } }
            }),
            prisma.expeciones_laborales.findMany({
                where: {
                    estado: true,
                    desde: { lte: fechaSolicitadaFin },
                    hasta: { gte: fechaSolicitadaInicio }
                }
            }),
            prisma.turno.findMany({
                where: {
                    estado: 1,
                    horarioReservado: { gte: inicioDia, lte: finDia },
                    id: { not: id } // Importante: Ignorar el turno que estamos editando
                },
                include: { vehiculo_servicio: { select: { duracion: true } } }
            })
        ]);

        // 5. Validar Excepciones
        if (excepciones.length > 0) {
            return { error: `Horario no disponible: ${excepciones[0].motivo}`, success: false };
        }

        // 6. Validar Horario Laboral
        if (!diaLaboralConfig) {
            return { error: "El negocio está cerrado este día.", success: false };
        }

        const minutosInicio = getMinutesFromZonedDate(fechaSolicitadaInicio);
        const minutosFin = minutosInicio + duracion;

        const entraEnMargen = diaLaboralConfig.margenes.some((margen) => {
            const mInicio = timeToMinutes(margen.desde);
            const mFin = timeToMinutes(margen.hasta);
            return minutosInicio >= mInicio && minutosFin <= mFin;
        });

        if (!entraEnMargen) {
            return { error: "El nuevo horario está fuera de la jornada laboral.", success: false };
        }

        // 7. Validar Superposición (Overlap)
        const hayChoque = turnosDelDia.some((t) => {
            const tInicio = t.horarioReservado;
            const tFin = addMinutes(tInicio, t.vehiculo_servicio.duracion);
            return (fechaSolicitadaInicio < tFin && fechaSolicitadaFin > tInicio);
        });

        if (hayChoque) {
            return { error: "El nuevo horario ya está ocupado por otro turno.", success: false };
        }

        // 8. Actualización final
        const turnoActualizado = await prisma.turno.update({
            where: { id },
            data: {
                horarioReservado: fechaSolicitadaInicio,
                patente: patente ? patente.toUpperCase() : turnoActual.patente,
                updatedAt: ahoraUTC, // Satisfacemos el campo obligatorio
            },
            include: {
                user: true,
                vehiculo_servicio: { include: { vehiculo: true, servicio: true } }
            }
        });

        let whatsappUrl = null;
        let detallesModificacion = null;

        // Notificación por correo
        try {
            if (turnoActualizado.user.email) {
                detallesModificacion = {
                    cliente: turnoActualizado.user.name || turnoActualizado.user.email,
                    fecha: formatInTimeZone(turnoActualizado.horarioReservado, TIMEZONE, "dd/MM/yyyy HH:mm"),
                    vehiculo: turnoActualizado.vehiculo_servicio.vehiculo.nombre || "Vehículo",
                    servicio: turnoActualizado.vehiculo_servicio.servicio.nombre || "Servicio",
                    precio: Number(turnoActualizado.precioCongelado)
                };
                await enviarCorreoModificacionTurno(turnoActualizado.user.email, detallesModificacion);
            }
        } catch (mailError) {
            console.error("[WPP] Error al enviar correo de modificación:", mailError);
        }

        // Generación del link de WhatsApp (independiente del correo)
        try {
            if (detallesModificacion) {
                whatsappUrl = await getWhatsAppUrl("modificar", detallesModificacion);
                console.log("[WPP] URL de modificación generada:", whatsappUrl);
            }
        } catch (wppError) {
            console.error("[WPP] Error al generar URL de WhatsApp (modificar):", wppError);
        }

        revalidatePath("/turno");

        // Devolvemos datos limpios para el front
        return {
            success: true,
            data: {
                ...turnoActualizado,
                whatsappUrl,
                precioCongelado: Number(turnoActualizado.precioCongelado),
                seniaCongelada: Number(turnoActualizado.seniaCongelada),
                vehiculo_servicio: {
                    ...turnoActualizado.vehiculo_servicio,
                    precio: Number(turnoActualizado.vehiculo_servicio.precio),
                    senia: Number(turnoActualizado.vehiculo_servicio.senia),
                    descuento: Number(turnoActualizado.vehiculo_servicio.descuento || 0)
                }
            }
        };

    } catch (error) {
        console.error("Error al actualizar turno:", error);
        return {
            error: error instanceof Error ? error.message : "Error desconocido al actualizar",
            success: false
        };
    }
}

export async function obtenerDatosParaTurno(): Promise<ActionState> {
    try {
        const [configuraciones, usuarios] = await Promise.all([
            prisma.vehiculo_servicio.findMany({
                where: { estado: true },
                include: {
                    vehiculo: {
                        select: { id: true, nombre: true }
                    },
                    servicio: {
                        select: { id: true, nombre: true }
                    }
                },
                orderBy: [
                    { vehiculo: { nombre: 'asc' } },
                    { servicio: { nombre: 'asc' } }
                ]
            }),
            prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true
                },
                orderBy: { name: 'asc' }
            })
        ]);

        // Convertimos los tipos Decimal de Prisma a Number para que el Front no explote
        const configuracionesPlanas = configuraciones.map((config) => ({
            ...config,
            precio: Number(config.precio),
            senia: Number(config.senia),
            descuento: config.descuento ? Number(config.descuento) : 0,
        }));

        return {
            success: true,
            data: {
                configuraciones: configuracionesPlanas,
                usuarios
            }
        };
    } catch (error) {
        console.error("Error en obtenerDatosParaTurno:", error);
        return {
            error: "Error al obtener datos para el formulario",
            success: false
        };
    }
}

export async function deleteTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {

    try {
        const id = formData.get("id") as string;

        if (!id) {
            return {
                error: "ID no proporcionado",
                success: false
            };
        }

        // Verificamos si existe antes de intentar actualizar
        const existe = await prisma.turno.findUnique({
            where: { id },
            include: {
                user: true,
                vehiculo_servicio: { include: { vehiculo: true, servicio: true } }
            }
        });

        if (!existe) {
            return {
                error: "El turno que intentas eliminar no existe",
                success: false
            };
        }

        // Realizamos el borrado lógico (estado: 0)
        await prisma.turno.update({
            where: { id },
            data: {
                estado: 0,
                updatedAt: new Date() // Satisfacemos el campo obligatorio
            }
        });

        let whatsappUrl = null;
        let detallesCancelacion = null;

        // Notificación por correo
        try {
            if (existe.user.email) {
                detallesCancelacion = {
                    cliente: existe.user.name || existe.user.email,
                    fecha: formatInTimeZone(existe.horarioReservado, TIMEZONE, "dd/MM/yyyy HH:mm"),
                    vehiculo: existe.vehiculo_servicio.vehiculo.nombre || "Vehículo",
                    servicio: existe.vehiculo_servicio.servicio.nombre || "Servicio",
                    precio: Number(existe.precioCongelado)
                };
                await enviarCorreoCancelacionTurno(existe.user.email, detallesCancelacion);
            }
        } catch (mailError) {
            console.error("[WPP] Error al enviar correo de cancelación:", mailError);
        }

        // Generación del link de WhatsApp (independiente del correo)
        try {
            if (detallesCancelacion) {
                whatsappUrl = await getWhatsAppUrl("cancelar", detallesCancelacion);
                console.log("[WPP] URL de cancelación generada:", whatsappUrl);
            } else {
                console.warn("[WPP] No hay detalles de cancelación para generar WhatsApp");
            }
        } catch (wppError) {
            console.error("[WPP] Error al generar URL de WhatsApp (cancelar):", wppError);
        }

        // Revalidamos la ruta para que la lista de turnos se actualice al instante
        revalidatePath("/turno");

        return {
            success: true,
            data: { id, whatsappUrl }
        };
    } catch (error) {
        console.error("Error eliminando turno:", error);
        return {
            error: error instanceof Error ? error.message : "Error desconocido al eliminar el turno",
            success: false
        };
    }
}

export async function completedTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {

    try {
        const id = formData.get("id") as string;

        if (!id) {
            return {
                error: "ID no proporcionado",
                success: false
            };
        }

        // Verificamos si existe antes de intentar actualizar
        const existe = await prisma.turno.findUnique({
            where: { id }
        });

        if (!existe) {
            return {
                error: "El turno que intentas eliminar no existe",
                success: false
            };
        }

        // Realizamos el borrado lógico (estado: 0)
        await prisma.turno.update({
            where: { id },
            data: {
                estado: 2, // Marcamos como completado
                updatedAt: new Date() // Satisfacemos el campo obligatorio
            }
        });

        // Revalidamos la ruta para que la lista de turnos se actualice al instante
        revalidatePath("/turno");

        return {
            success: true,
            data: { id }
        };
    } catch (error) {
        console.error("Error eliminando turno:", error);
        return {
            error: error instanceof Error ? error.message : "Error desconocido al eliminar el turno",
            success: false
        };
    }
}