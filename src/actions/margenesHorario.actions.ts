"use server";

import { revalidatePath } from "next/cache";
import { esAdmin } from "@/lib/esAdmin";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  success: boolean;
  data?: any;
  error?: string;
};

const NO_AUTORIZADO: ActionState = { error: "No autorizado", success: false };

/**
 * Valida formato de hora HH:mm
 */
function validarFormatoHora(hora: string): boolean {
  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(hora);
}

/**
 * Compara dos horas en formato HH:mm
 * Retorna: -1 si hora1 < hora2, 0 si son iguales, 1 si hora1 > hora2
 */
function compararHoras(hora1: string, hora2: string): number {
  const [h1, m1] = hora1.split(":").map(Number);
  const [h2, m2] = hora2.split(":").map(Number);
  
  const minutos1 = h1 * 60 + m1;
  const minutos2 = h2 * 60 + m2;
  
  if (minutos1 < minutos2) return -1;
  if (minutos1 > minutos2) return 1;
  return 0;
}

/**
 * Verifica si dos rangos de horarios se solapan
 */
function horariosSeSuperponen(
  desde1: string,
  hasta1: string,
  desde2: string,
  hasta2: string
): boolean {
  // Rango 1: [desde1, hasta1]
  // Rango 2: [desde2, hasta2]
  
  // No se superponen si:
  // - hasta1 <= desde2 (rango 1 termina antes que empiece rango 2)
  // - hasta2 <= desde1 (rango 2 termina antes que empiece rango 1)
  
  const hasta1LeDesde2 = compararHoras(hasta1, desde2) <= 0;
  const hasta2LeDesde1 = compararHoras(hasta2, desde1) <= 0;
  
  return !(hasta1LeDesde2 || hasta2LeDesde1);
}

// Crear margen laboral
export async function createMargenLaboral(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await esAdmin())) return NO_AUTORIZADO;

  try {
    const diaId = formData.get("diaId") as string;
    const estado = formData.get("estado") === "true";
    const desde = formData.get("desde") as string;
    const hasta = formData.get("hasta") as string;

    // Validar que 'hasta' sea mayor que 'desde'
    if (compararHoras(hasta, desde) <= 0) {
      return {
        success: false,
        error: "La hora 'Cierre' debe ser mayor que la hora 'Apertura'",
      };
    }

    // Verificar que el día laboral existe
    const diaLaboral = await prisma.dia_laboral.findUnique({
      where: { id: diaId },
    });

    // Obtener todos los márgenes del día para verificar solapamientos
    const margenesExistentes = await prisma.margenes_laborales.findMany({
      where: { diaId },
    });

    // Verificar solapamientos con cada margen existente
    for (const margen of margenesExistentes) {
      if (horariosSeSuperponen(desde, hasta, margen.desde, margen.hasta)) {
        return {
          success: false,
          error: `El horario se solapa con el rango ${margen.desde} - ${margen.hasta}`,
        };
      }
    }

    // Crear el margen laboral (ahora con strings)
    const margen = await prisma.margenes_laborales.create({
      data: {
        diaId,
        estado,
        desde,
        hasta,
      },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: margen,
    };
  } catch (error) {
    console.error("Error al crear margen laboral:", error);
    return {
      success: false,
      error: "Error al crear el margen laboral",
    };
  }
}

// Actualizar margen laboral
export async function updateMargenLaboral(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await esAdmin())) return NO_AUTORIZADO;

  try {
    const id = formData.get("id") as string;
    const diaId = formData.get("diaId") as string;
    const estado = formData.get("estado") === "true";
    const desde = formData.get("desde") as string;
    const hasta = formData.get("hasta") as string;

    // Validar que 'hasta' sea mayor que 'desde'
    if (compararHoras(hasta, desde) <= 0) {
      return {
        success: false,
        error: "La hora 'Cierre' debe ser mayor que la hora 'Apertura'",
      };
    }

    // Verificar que existe
    const existing = await prisma.margenes_laborales.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Margen laboral no encontrado",
      };
    }

    // Obtener todos los márgenes del día (excluyendo el actual)
    const margenesExistentes = await prisma.margenes_laborales.findMany({
      where: {
        diaId,
        id: { not: id },
      },
    });

    // Verificar solapamientos
    for (const margen of margenesExistentes) {
      if (horariosSeSuperponen(desde, hasta, margen.desde, margen.hasta)) {
        return {
          success: false,
          error: `El horario se solapa con el rango ${margen.desde} - ${margen.hasta}`,
        };
      }
    }

    // Actualizar el margen laboral
    const margen = await prisma.margenes_laborales.update({
      where: { id },
      data: {
        estado,
        desde,
        hasta,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: margen,
    };
  } catch (error) {
    console.error("Error al actualizar margen laboral:", error);
    return {
      success: false,
      error: "Error al actualizar el margen laboral",
    };
  }
}

// Eliminar margen laboral
export async function deleteMargenLaboral(id: string): Promise<ActionState> {
  if (!(await esAdmin())) return NO_AUTORIZADO;

  try {

    await prisma.margenes_laborales.delete({
      where: { id },
    });

    revalidatePath("/diaLaboral");

    return {
      success: true,
      data: { message: "Margen laboral eliminado correctamente" },
    };
  } catch (error) {
    console.error("Error al eliminar margen laboral:", error);
    return {
      success: false,
      error: "Error al eliminar el margen laboral",
    };
  }
}

// Obtener márgenes de un día laboral
export async function getMargenesLaborales(diaId: string) {
  try {
    const margenes = await prisma.margenes_laborales.findMany({
      where: { diaId },
      orderBy: { desde: "asc" },
    });

    return margenes;
  } catch (error) {
    console.error("Error al obtener márgenes laborales:", error);
    throw new Error("Error al obtener los márgenes laborales");
  }
}

const DIAS_NOMBRES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export async function getHorariosCompactos() {
  try {
    const diasLaborales = await prisma.dia_laboral.findMany({
      where: { estado: true },
      include: {
        margenes: {
          where: { estado: true },
          orderBy: { desde: "asc" },
        },
      },
      orderBy: { dia: "asc" }, // 0 = Domingo, 1 = Lunes, etc.
    });

    if (diasLaborales.length === 0) return ["Cerrado"];

    // 1. Mapeamos a un formato procesable
    const diasProcesados = diasLaborales.map((d) => {
      const horarioStr = d.margenes
        .map((m) => `${m.desde} a ${m.hasta}`)
        .join(" / ");
      
      return {
        num: d.dia,
        nombre: DIAS_NOMBRES[d.dia],
        horario: horarioStr || "Cerrado",
      };
    });

    // 2. Agrupación por continuidad y similitud de horarios
    const grupos: { start: number; end: number; horario: string }[] = [];

    for (const dia of diasProcesados) {
      const ultimoGrupo = grupos[grupos.length - 1];

      // Si el horario es igual al del grupo anterior Y es el día consecutivo
      if (ultimoGrupo && ultimoGrupo.horario === dia.horario && ultimoGrupo.end === dia.num - 1) {
        ultimoGrupo.end = dia.num;
      } else {
        grupos.push({
          start: dia.num,
          end: dia.num,
          horario: dia.horario,
        });
      }
    }

    // 3. Formatear el string final
    return grupos.map((g) => {
      const nombreRango =
        g.start === g.end
          ? DIAS_NOMBRES[g.start]
          : `${DIAS_NOMBRES[g.start]} a ${DIAS_NOMBRES[g.end]}`;
      
      return `${nombreRango} ${g.horario}`;
    });
    
  } catch (error) {
    console.error("Error obteniendo horarios:", error);
    return ["Error al cargar horarios"];
  }
}