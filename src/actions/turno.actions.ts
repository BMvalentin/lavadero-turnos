"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { addMinutes } from "date-fns";
import { serializeData } from "@/lib/utils";
import { enviarCorreoCreacionTurno, enviarCorreoModificacionTurno, enviarCorreoCancelacionTurno, TurnoDetails } from "@/lib/mail";
import { obtenerSiteConfig } from "./configuracion.actions";
import { numeroWhatsApp } from "@/lib/siteConfig";
import { usuarioActual } from "@/lib/esAdmin";
import { horarioReservadoSchema, patenteSchema } from "@/lib/zod";

const TIMEZONE = process.env.TIMEZONE || "America/Argentina/Buenos_Aires";

export type ActionState = {
    error?: string;
    success?: boolean;
    data?: any;
};

const NO_AUTORIZADO: ActionState = { error: "No autorizado", success: false };

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// La espera por el bloqueo cuenta dentro del timeout, así que lo damos holgado.
const OPCIONES_TRANSACCION = { maxWait: 5000, timeout: 15000 };

// Bloquea (FOR UPDATE) las filas del día de la semana hasta que termine la
// transacción. Las reservas del mismo día quedan en fila en vez de validarse
// en paralelo contra datos que todavía no incluyen el turno del otro.
async function bloquearDiaLaboral(tx: TxClient, dia: number) {
    await tx.$queryRaw`SELECT id FROM dia_laboral WHERE dia = ${dia} FOR UPDATE`;
}

async function getWhatsAppUrl(tipo: "solicitar" | "modificar" | "cancelar", detalles: TurnoDetails) {
    // Los avisos van al mismo teléfono de contacto que se muestra en la web.
    const { TELEFONO } = await obtenerSiteConfig();
    const ownerNumber = numeroWhatsApp(TELEFONO);
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
    const actual = await usuarioActual();
    if (!actual) return NO_AUTORIZADO;

    try {
        const vehiculoServicioId = formData.get("vehiculoServicioId") as string;
        // Solo un admin puede reservar a nombre de otro usuario.
        const userId = actual.esAdmin ? (formData.get("userId") as string) : actual.id;
        const horarioReservadoStr = formData.get("horarioReservado") as string;
        const patenteStr = formData.get("patente") as string;

        if (!vehiculoServicioId || !userId || !horarioReservadoStr || !patenteStr) {
            return { error: "Todos los campos son requeridos", success: false };
        }

        if (!horarioReservadoSchema.safeParse(horarioReservadoStr).success) {
            return { error: "Horario inválido", success: false };
        }

        const patenteValidada = patenteSchema.safeParse(patenteStr);
        if (!patenteValidada.success) {
            return { error: "Patente inválida: usá solo letras y números (5 a 10 caracteres)", success: false };
        }
        const patente = patenteValidada.data;

        // --- Lógica de Desfase :) ---
        const fechaSolicitadaInicio = fromZonedTime(horarioReservadoStr, TIMEZONE);
        const ahoraUTC = new Date();

        if (isNaN(fechaSolicitadaInicio.getTime())) {
            return { error: "Horario inválido", success: false };
        }

        if (fechaSolicitadaInicio <= addMinutes(ahoraUTC, 10)) {
            return { error: "Reserva con al menos 10 min de antelación.", success: false };
        }

        const vehiculoServicio = await prisma.vehiculo_servicio.findUnique({
            where: { id: vehiculoServicioId },
            select: { duracion: true, precio: true, senia: true, estado: true }
        });

        // Un servicio dado de baja no se puede reservar aunque alguien tenga su id.
        if (!vehiculoServicio || !vehiculoServicio.estado) return { error: "Servicio no encontrado", success: false };

        const fechaSolicitadaFin = addMinutes(fechaSolicitadaInicio, vehiculoServicio.duracion);

        // Rango del día en Argentina para buscar colisiones
        const fechaSoloString = horarioReservadoStr.split('T')[0]; // "2026-01-31"
        const inicioDia = fromZonedTime(`${fechaSoloString} 00:00:00`, TIMEZONE);
        const finDia = fromZonedTime(`${fechaSoloString} 23:59:59`, TIMEZONE);

        const diaSemanaIndex = toZonedTime(fechaSolicitadaInicio, TIMEZONE).getDay();

        // La validación de choque y el alta van en una transacción que bloquea el
        // día laboral: así dos reservas simultáneas no pueden pasar la validación
        // a la vez y quedar superpuestas.
        const resultado = await prisma.$transaction(async (tx) => {
            await bloquearDiaLaboral(tx, diaSemanaIndex);

            const [diaLaboralConfig, excepciones, turnosDelDia] = await Promise.all([
                tx.dia_laboral.findFirst({
                    where: { dia: diaSemanaIndex, estado: true },
                    include: { margenes: { where: { estado: true } } }
                }),
                tx.expeciones_laborales.findMany({
                    where: {
                        estado: true,
                        desde: { lte: fechaSolicitadaFin },
                        hasta: { gte: fechaSolicitadaInicio }
                    }
                }),
                tx.turno.findMany({
                    where: {
                        estado: 1,
                        horarioReservado: { gte: inicioDia, lte: finDia }
                    },
                    include: { vehiculo_servicio: { select: { duracion: true } } }
                })
            ]);

            if (excepciones.length > 0) {
                return { error: `No disponible: ${excepciones[0].motivo}` };
            }

            if (!diaLaboralConfig) {
                return { error: "Cerrado este día." };
            }

            // Validar márgenes usando minutos locales
            const minutosInicio = getMinutesFromZonedDate(fechaSolicitadaInicio);
            const minutosFin = minutosInicio + vehiculoServicio.duracion;

            const entraEnMargen = diaLaboralConfig.margenes.some((m) => {
                return minutosInicio >= timeToMinutes(m.desde) && minutosFin <= timeToMinutes(m.hasta);
            });

            if (!entraEnMargen) {
                return { error: "Horario fuera de la jornada laboral." };
            }

            // Validar choque con otros turnos
            const hayChoque = turnosDelDia.some((t) => {
                const tInicio = t.horarioReservado;
                const tFin = addMinutes(tInicio, t.vehiculo_servicio.duracion);
                return (fechaSolicitadaInicio < tFin && fechaSolicitadaFin > tInicio);
            });

            if (hayChoque) return { error: "El horario ya está ocupado." };

            const turno = await tx.turno.create({
                data: {
                    id: crypto.randomUUID(),
                    vehiculoServicioId,
                    userId,
                    horarioReservado: fechaSolicitadaInicio,
                    precioCongelado: vehiculoServicio.precio,
                    seniaCongelada: vehiculoServicio.senia,
                    patente,
                    estado: 1,
                    createdAt: ahoraUTC,
                    updatedAt: ahoraUTC,
                }
            });

            return { turno };
        }, OPCIONES_TRANSACCION);

        if ("error" in resultado) return { error: resultado.error, success: false };
        const nuevoTurno = resultado.turno;

        let whatsappUrl: string | null = null;
        let turnoDetalles: TurnoDetails | null = null;

        try {
            const turnoCompleto = await prisma.turno.findUnique({
                where: { id: nuevoTurno.id },
                include: {
                    user: true,
                    vehiculo_servicio: {
                        include: { vehiculo: true, servicio: true }
                    }
                }
            });

            if (turnoCompleto) {
                turnoDetalles = {
                    cliente: turnoCompleto.user.name || turnoCompleto.user.email || "Cliente",
                    fecha: formatInTimeZone(turnoCompleto.horarioReservado, TIMEZONE, "dd/MM/yyyy HH:mm"),
                    vehiculo: turnoCompleto.vehiculo_servicio.vehiculo.nombre || "Vehículo",
                    servicio: turnoCompleto.vehiculo_servicio.servicio.nombre || "Servicio",
                    precio: Number(turnoCompleto.precioCongelado)
                };

                // Correo: solo si el cliente tiene email cargado (esto sí es opcional)
                if (turnoCompleto.user.email) {
                    try {
                        await enviarCorreoCreacionTurno(turnoCompleto.user.email, turnoDetalles);
                    } catch (mailError) {
                        console.error("[MAIL] Error al enviar correo de creación:", mailError);
                    }
                }
            }
        } catch (fetchError) {
            console.error("[TURNO] Error al obtener detalles del turno recién creado:", fetchError);
        }

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

        return { success: true, data: { id: nuevoTurno.id, whatsappUrl } };

    } catch (error) {
        console.error(error);
        return { error: "Error al crear el turno", success: false };
    }
}

export async function getTurnos(params?: { userId?: string; fecha?: string }): Promise<ActionState> {
    const actual = await usuarioActual();
    if (!actual) return NO_AUTORIZADO;

    try {
        let where: any = { estado: 1 };
        // Un usuario común solo ve sus propios turnos.
        const userId = actual.esAdmin ? params?.userId : actual.id;
        if (userId) where.userId = userId;

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
    const actual = await usuarioActual();
    if (!actual) return NO_AUTORIZADO;

    try {
        const id = formData.get("id") as string;
        const horarioReservadoStr = formData.get("horarioReservado") as string; // Viene "YYYY-MM-DDTHH:mm"
        const patenteStr = formData.get("patente") as string;

        if (!id) return { error: "ID no proporcionado", success: false };

        if (horarioReservadoStr && !horarioReservadoSchema.safeParse(horarioReservadoStr).success) {
            return { error: "Horario inválido", success: false };
        }

        let patente: string | null = null;
        if (patenteStr) {
            const patenteValidada = patenteSchema.safeParse(patenteStr);
            if (!patenteValidada.success) {
                return { error: "Patente inválida: usá solo letras y números (5 a 10 caracteres)", success: false };
            }
            patente = patenteValidada.data;
        }

        // 1. Obtener el turno actual
        const turnoActual = await prisma.turno.findUnique({
            where: { id },
            include: { vehiculo_servicio: true }
        });

        if (!turnoActual) return { error: "Turno no encontrado", success: false };
        if (turnoActual.userId !== actual.id && !actual.esAdmin) return NO_AUTORIZADO;

        // Solo se modifican turnos pendientes que todavía no pasaron.
        if (turnoActual.estado !== 1) {
            return { error: "Solo se pueden modificar turnos pendientes.", success: false };
        }
        if (turnoActual.horarioReservado < new Date()) {
            return { error: "No se puede modificar un turno que ya pasó.", success: false };
        }

        // 2. Manejo de fecha con Zona Horaria
        // Si viene un string nuevo, lo interpretamos como Argentina. Si no, mantenemos el Date de la DB.
        const fechaSolicitadaInicio = horarioReservadoStr
            ? fromZonedTime(horarioReservadoStr, TIMEZONE)
            : turnoActual.horarioReservado;

        const duracion = turnoActual.vehiculo_servicio.duracion;
        const fechaSolicitadaFin = addMinutes(fechaSolicitadaInicio, duracion);
        const ahoraUTC = new Date();

        if (isNaN(fechaSolicitadaInicio.getTime())) {
            return { error: "Horario inválido", success: false };
        }

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

        // Igual que en createTurno: validación y guardado bajo el bloqueo del día.
        const resultado = await prisma.$transaction(async (tx) => {
            await bloquearDiaLaboral(tx, diaSemanaIndex);

            const [diaLaboralConfig, excepciones, turnosDelDia] = await Promise.all([
                tx.dia_laboral.findFirst({
                    where: { dia: diaSemanaIndex, estado: true },
                    include: { margenes: { where: { estado: true } } }
                }),
                tx.expeciones_laborales.findMany({
                    where: {
                        estado: true,
                        desde: { lte: fechaSolicitadaFin },
                        hasta: { gte: fechaSolicitadaInicio }
                    }
                }),
                tx.turno.findMany({
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
                return { error: `Horario no disponible: ${excepciones[0].motivo}` };
            }

            // 6. Validar Horario Laboral
            if (!diaLaboralConfig) {
                return { error: "El negocio está cerrado este día." };
            }

            const minutosInicio = getMinutesFromZonedDate(fechaSolicitadaInicio);
            const minutosFin = minutosInicio + duracion;

            const entraEnMargen = diaLaboralConfig.margenes.some((margen) => {
                const mInicio = timeToMinutes(margen.desde);
                const mFin = timeToMinutes(margen.hasta);
                return minutosInicio >= mInicio && minutosFin <= mFin;
            });

            if (!entraEnMargen) {
                return { error: "El nuevo horario está fuera de la jornada laboral." };
            }

            // 7. Validar Superposición (Overlap)
            const hayChoque = turnosDelDia.some((t) => {
                const tInicio = t.horarioReservado;
                const tFin = addMinutes(tInicio, t.vehiculo_servicio.duracion);
                return (fechaSolicitadaInicio < tFin && fechaSolicitadaFin > tInicio);
            });

            if (hayChoque) {
                return { error: "El nuevo horario ya está ocupado por otro turno." };
            }

            // 8. Actualización final
            const turno = await tx.turno.update({
                where: { id },
                data: {
                    horarioReservado: fechaSolicitadaInicio,
                    patente: patente ?? turnoActual.patente,
                    updatedAt: ahoraUTC, // Satisfacemos el campo obligatorio
                },
                include: {
                    user: true,
                    vehiculo_servicio: { include: { vehiculo: true, servicio: true } }
                }
            });

            return { turno };
        }, OPCIONES_TRANSACCION);

        if ("error" in resultado) return { error: resultado.error, success: false };
        const turnoActualizado = resultado.turno;

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
            error: "No se pudo actualizar el turno",
            success: false
        };
    }
}

export async function obtenerDatosParaTurno(): Promise<ActionState> {
    const actual = await usuarioActual();
    if (!actual) return NO_AUTORIZADO;

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
            // La lista de usuarios solo la necesita el admin para reservar a nombre de otro.
            actual.esAdmin
                ? prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true
                    },
                    orderBy: { name: 'asc' }
                })
                : Promise.resolve([])
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
    const actual = await usuarioActual();
    if (!actual) return NO_AUTORIZADO;

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

        if (existe.userId !== actual.id && !actual.esAdmin) return NO_AUTORIZADO;

        await prisma.turno.update({
            where: { id },
            data: {
                estado: 0,
                updatedAt: new Date()
            }
        });

        let whatsappUrl: string | null = null;
        let detallesCancelacion: TurnoDetails = {
            cliente: existe.user.name || existe.user.email || "Cliente",
            fecha: formatInTimeZone(existe.horarioReservado, TIMEZONE, "dd/MM/yyyy HH:mm"),
            vehiculo: existe.vehiculo_servicio.vehiculo.nombre || "Vehículo",
            servicio: existe.vehiculo_servicio.servicio.nombre || "Servicio",
            precio: Number(existe.precioCongelado)
        };

        if (existe.user.email) {
            try {
                await enviarCorreoCancelacionTurno(existe.user.email, detallesCancelacion);
            } catch (mailError) {
                console.error("[MAIL] Error al enviar correo de cancelación:", mailError);
            }
        }

        // ── WhatsApp: se genera siempre, independiente del correo ──
        try {
            whatsappUrl = await getWhatsAppUrl("cancelar", detallesCancelacion);
            console.log("[WPP] URL de cancelación generada:", whatsappUrl);
        } catch (wppError) {
            console.error("[WPP] Error al generar URL de WhatsApp (cancelar):", wppError);
        }

        return {
            success: true,
            data: { id, whatsappUrl: whatsappUrl || ""}
        };
    } catch (error) {
        console.error("Error eliminando turno:", error);
        return {
            error: "No se pudo eliminar el turno",
            success: false
        };
    }
}

export async function completedTurno(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    if (!(await usuarioActual())?.esAdmin) return NO_AUTORIZADO;

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
            error: "No se pudo eliminar el turno",
            success: false
        };
    }
}