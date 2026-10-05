import { auth } from "@/auth";

// Las server actions se pueden llamar directamente aunque la página esté
// protegida por el middleware, así que cada acción de admin debe verificarlo.
export async function esAdmin(): Promise<boolean> {
    const session = await auth();
    return session?.user?.role === "ADMIN";
}
