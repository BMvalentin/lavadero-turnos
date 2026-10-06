import { auth } from "@/auth";

// Las server actions se pueden llamar directamente aunque la página esté
// protegida por el middleware, así que cada acción de admin debe verificarlo.
export async function esAdmin(): Promise<boolean> {
    const session = await auth();
    return session?.user?.role === "ADMIN";
}

// Devuelve el usuario logueado (o null). Las acciones que operan sobre datos
// propios deben tomar el id de acá y nunca de lo que manda el cliente.
export async function usuarioActual() {
    const session = await auth();
    if (!session?.user?.id) return null;
    return { id: session.user.id, role: session.user.role, esAdmin: session.user.role === "ADMIN" };
}
