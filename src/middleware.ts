import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import { consumir } from "@/lib/rateLimit";

const { auth } = NextAuth(authConfig);

const MINUTO = 60_000;

// Límites por tipo de request (cantidad por ventana).
const LIMITES = {
  // Login y registro: frena fuerza bruta de contraseñas y altas masivas.
  acceso: { limite: 10, ventanaMs: 15 * MINUTO },
  // Perfil, cambio de contraseña y cancelaciones desde el panel.
  panel: { limite: 20, ventanaMs: MINUTO },
  // El resto de las server actions (reservas, consulta de horarios, etc.).
  usuario: { limite: 60, ventanaMs: MINUTO },
  anonimo: { limite: 30, ventanaMs: MINUTO },
};

function obtenerIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || req.headers.get("x-real-ip") || "desconocida";
}

// Las server actions llegan como POST con el header `Next-Action`, a la ruta de
// la página que las llama. Solo limitamos esas y el inicio de sesión de NextAuth.
function aplicarRateLimit(req: Request & { auth: any; nextUrl: URL }): Response | null {
  const esServerAction = req.method === "POST" && req.headers.has("next-action");
  // Solo el inicio de sesión: /api/auth/session también recibe POST al refrescar la sesión.
  const esAuthPost = req.method === "POST" && req.nextUrl.pathname.startsWith("/api/auth/signin");
  if (!esServerAction && !esAuthPost) return null;

  const usuario = req.auth?.user;
  if (usuario?.role === "ADMIN") return null;

  const ip = obtenerIp(req);
  const ruta = req.nextUrl.pathname;

  let bucket: keyof typeof LIMITES;
  let id: string;
  if (ruta === "/login" || ruta === "/register" || esAuthPost) {
    bucket = "acceso";
    id = ip;
  } else if (usuario?.id && ruta.startsWith("/dashboard")) {
    bucket = "panel";
    id = usuario.id;
  } else if (usuario?.id) {
    bucket = "usuario";
    id = usuario.id;
  } else {
    bucket = "anonimo";
    id = ip;
  }

  const { limite, ventanaMs } = LIMITES[bucket];
  const resultado = consumir(`${bucket}:${id}`, limite, ventanaMs);
  if (resultado.permitido) return null;

  return new NextResponse("Demasiados intentos. Esperá un momento y volvé a intentar.", {
    status: 429,
    headers: { "Retry-After": String(resultado.reintentarEnSeg) },
  });
}

export default auth((req) => {
  const bloqueado = aplicarRateLimit(req);
  if (bloqueado) return bloqueado;

  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isGestionRoute = ["/admin", "/excepcionesLaborales", "/diaLaboral"].includes(nextUrl.pathname);
  
  const isProtectedRoute = ["/dashboard", "/turnos", "/admin", "/excepcionesLaborales", "/diaLaboral"].some((route) => 
    nextUrl.pathname.startsWith(route)
  );

  if (isApiAuthRoute) return NextResponse.next();

  // 1. .redirect
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Lógica de ADMIN
  if (isAdminRoute || isGestionRoute) {
    if (!isLoggedIn) {
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
    }
    
    if (userRole !== "ADMIN") {
      // Redirigir si no tiene permisos
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    
    return NextResponse.next();
  }

  // 3. Protección de rutas generales
  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
  }

  return NextResponse.next();
});