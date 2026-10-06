"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { esAdmin, usuarioActual } from "@/lib/esAdmin";

const NO_AUTORIZADO = { success: false, message: "No autorizado" };

export async function getAllUsers() {
  if (!(await esAdmin())) return [];

  try {
    const users = await prisma.user.findMany({
      orderBy: [
        { role: 'asc' },      // ADMIN primero, luego USER
        { createdAt: 'desc' } // Del más nuevo al más antiguo
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        telefono: true
      }
    });
    return users;
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
}

export async function toggleUserRole(userId: string, currentRole: string) {
  const actual = await usuarioActual();
  if (!actual?.esAdmin) return NO_AUTORIZADO;
  if (actual.id === userId) return { success: false, message: "No podés cambiar tu propio rol" };

  try {
    // El rol nuevo se decide con el valor de la base, no con el que manda el cliente.
    const usuario = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!usuario) return { success: false, message: "Usuario no encontrado" };
    const newRole = usuario.role === "ADMIN" ? "USER" : "ADMIN";
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al actualizar el rol" };
  }
}

export async function deleteUserAccount(userId: string) {
  const actual = await usuarioActual();
  if (!actual?.esAdmin) return NO_AUTORIZADO;
  if (actual.id === userId) return { success: false, message: "No podés eliminar tu propia cuenta" };

  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error al eliminar usuario" };
  }
}