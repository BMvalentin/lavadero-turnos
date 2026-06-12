"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { limpiarTurnosAntiguos, limpiarTurnosCancelados } from "@/actions/admin.actions";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";

export default function BotonesLimpieza() {
  const [loadingAntiguos, setLoadingAntiguos] = useState(false);
  const [loadingCancelados, setLoadingCancelados] = useState(false);
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const handleLimpiarAntiguos = async () => {
    const isConfirmed = await confirm({
      title: "Confirmar limpieza de turnos antiguos",
      message: "¿Estás seguro de que deseas ELIMINAR DEFINITIVAMENTE todos los turnos antiguos? Esta acción no se puede deshacer."
    });
    if (!isConfirmed) {
      return;
    }

    setLoadingAntiguos(true);
    const res = await limpiarTurnosAntiguos();
    setLoadingAntiguos(false);

    if (res.success) {
      addToast(`Se han eliminado ${res.count} turnos antiguos.`, "success");
    } else {
      addToast("Error al limpiar turnos antiguos", "error");
    }
  };

  const handleLimpiarCancelados = async () => {
    const isConfirmed = await confirm({
      title: "Confirmar limpieza de turnos cancelados",
      message: "¿Estás seguro de que deseas ELIMINAR DEFINITIVAMENTE todos los turnos cancelados? Esta acción no se puede deshacer."
    });
    if (!isConfirmed) {
      return;
    }

    setLoadingCancelados(true);
    const res = await limpiarTurnosCancelados();
    setLoadingCancelados(false);

    if (res.success) {
      addToast(`Se han eliminado ${res.count} turnos cancelados.`, "success");
    } else {
      addToast("Error al limpiar turnos cancelados", "error");
    }
  };

  return (
    <div className="flex gap-3 mt-4 sm:mt-0">
      <Button
        variant="rojo"
        onClick={handleLimpiarAntiguos}
        disabled={loadingAntiguos || loadingCancelados}
      >
        {loadingAntiguos ? "Procesando..." : "Limpiar antiguos"}
      </Button>

      <Button
        variant="rojo"
        onClick={handleLimpiarCancelados}
        disabled={loadingCancelados || loadingAntiguos}
      >
        {loadingCancelados ? "Procesando..." : "Limpiar cancelados"}
      </Button>
    </div>
  );
}