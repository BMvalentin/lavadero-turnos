"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { DoorOpen, Menu, X } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/actions/auth-actions";
import Image from "next/image";

interface HeaderProps {
  session: any;
}

export function Header({ session }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);
  const role = session?.user?.role;
  const image = session?.user?.image || "/images/avatar-default.svg";
  const name = session?.user?.name || "Usuario";

  return (
    <>
      {/* HEADER PRINCIPAL */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg bg-linear-to-br from-white to-white/60 shadow-md w-full max-w-dvw max-h-dvh"
      >
        <div className="container flex items-center justify-between h-16 mx-auto px-4 select-none">
          
          <Link href="/#home" className="flex items-center gap-2">
            <Image src="/images/logopng.png" alt="" width={'64'} height={'64'}/>
            <span className="block sm:hidden lg:block text-xl font-semibold text-foreground">
              Chapa{" "}<span className="text-primary">Detail</span>
            </span>
          </Link>

          {/* NAVEGACIÓN DESKTOP */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8">
            {role === "ADMIN" ? (
              <>
                <Link href="/servicio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="celeste" size="sm">Servicios</Button>
                </Link>
                <Link href="/vehiculo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="celeste" size="sm">Vehículos</Button>
                </Link>
                <Link href="/vehiculoXServicio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="celeste" size="sm">Asignar Servicios</Button>
                </Link>
                <Link href="/turno" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="celeste" size="sm">Crear turnos</Button>
                </Link>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="celeste" size="sm">Panel admin</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/#servicios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="link" size="sm">Servicios</Button>
                </Link>
                <Link href="/#nosotros" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="link" size="sm">Nosotros</Button>
                </Link>
                <Link href="/#ubicacion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="link" size="sm">Ubicación</Button>
                </Link>
                <Link href={session ? "/turno" : "/login"} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Button variant="celeste" size="sm">Turnos</Button>
                </Link>
              </>
            )}
          </nav>

          {/* ACCIONES DE USUARIO DESKTOP */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Link className="flex flex-row items-center gap-2" href="/dashboard">
                  <Image src={image} alt="" className="rounded-full" width={'32'} height={'32'}/>
                  <Button variant="link" size="sm" className="px-0">{name}</Button>
                </Link>
                <form action={handleSignOut}>
                  <Button variant="rojo" size="sm" type="submit">Salir</Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button variant="amarillo" size="sm">
                  <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
                </Button>
              </Link>
            )}
          </div>

          {/* BOTON HAMBURGUESA MOBILE */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* SIDEBAR MOBILE - AHORA ESTÁ FUERA DEL HEADER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Overlay oscuro de fondo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/50 z-[998] md:hidden"
            />

            {/* Menú Lateral */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 w-[280px] h-screen bg-white z-[999] shadow-xl flex flex-col p-6 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-semibold text-foreground">
                  Menú
                </span>
                <button onClick={closeMenu} className="p-2 -mr-2">
                  <X className="w-6 h-6 text-foreground" />
                </button>
              </div>

              {/* Links de Navegación Mobile */}
              <nav className="flex flex-col gap-4 overflow-y-auto mb-6 flex-1">
                {role === "ADMIN" ? (
                  <>
                    <Link href="/servicio" onClick={closeMenu}><Button variant="celeste" className="w-full justify-start">Servicios</Button></Link>
                    <Link href="/vehiculo" onClick={closeMenu}><Button variant="celeste" className="w-full justify-start">Vehículos</Button></Link>
                    <Link href="/vehiculoXServicio" onClick={closeMenu}><Button variant="celeste" className="w-full justify-start">Asignar Servicios</Button></Link>
                    <Link href="/turno" onClick={closeMenu}><Button variant="celeste" className="w-full justify-start">Crear turnos</Button></Link>
                    <Link href="/admin" onClick={closeMenu}><Button variant="celeste" className="w-full justify-start">Panel admin</Button></Link>
                  </>
                ) : (
                  <>
                    <Link href="/#servicios" onClick={closeMenu}><Button variant="outline" className="w-full justify-start">Servicios</Button></Link>
                    <Link href="/#nosotros" onClick={closeMenu}><Button variant="outline" className="w-full justify-start">Nosotros</Button></Link>
                    <Link href="/#ubicacion" onClick={closeMenu}><Button variant="outline" className="w-full justify-start">Ubicación</Button></Link>
                    <Link href={session ? "/turno" : "/login"} onClick={closeMenu}><Button variant="celeste" className="w-full justify-start">Turnos</Button></Link>
                  </>
                )}
              </nav>

              {/* Acciones de Usuario Mobile (Pegadas abajo) */}
              <div className="mt-auto border-t pt-6 flex flex-col gap-4 pb-4">
                {session ? (
                  <>
                    <Link href="/dashboard" onClick={closeMenu} className="flex items-center gap-3">
                      <Image src={image} alt="" className="rounded-full" width={'40'} height={'40'}/>
                      <span className="font-medium text-sm truncate">{name}</span>
                    </Link>
                    <form action={handleSignOut} onSubmit={closeMenu}>
                      <Button variant="rojo" className="w-full" type="submit">Salir</Button>
                    </form>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="amarillo" className="w-full">
                      <DoorOpen className="w-4 h-4 mr-2" /> Iniciar Sesión
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}