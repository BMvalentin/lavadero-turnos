"use client";

import { useState, useTransition } from "react";
import { deleteExcepcion, softDeleteExcepcion } from "@/actions/excepcionesLaborales.actions";
import ExcepcionForm from "./ExcepcionesForm";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";

type Excepcion = {
  id: string;
  motivo: string;
  desde: Date;
  hasta: Date;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ExcepcionesListProps = {
  excepciones: Excepcion[];
};

export default function ExcepcionesList({ excepciones }: ExcepcionesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { confirm } = useConfirm();
  const { addToast } = useToast();

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este día laboral? Esta acción no se puede deshacer."
    });
    if (!isConfirmed) return;

    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteExcepcion(id);
      setDeletingId(null);

      if (!result.success) {
        addToast("Error al eliminar la excepción", "error");
      } else {
        addToast("Excepción eliminada exitosamente", "success");
      }
    });
  };

  const handleSoftDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Confirmar desactivación",
      message: "¿Estás seguro de que deseas desactivar esta excepción?"
    });
    if (!isConfirmed) return;

    setDeletingId(id);
    startTransition(async () => {
      const result = await softDeleteExcepcion(id);
      setDeletingId(null);

      if (!result.success) {
        addToast("Error al desactivar la excepción", "error");
      } else {
        addToast("Excepción desactivada exitosamente", "success");
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (excepciones.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">No hay excepciones laborales registradas</p>
        <p className="text-gray-400 text-sm mt-2">Crea una nueva excepción usando el formulario</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {excepciones.map((excepcion) => (
        <div
          key={excepcion.id}
          className={`bg-white border rounded-lg shadow-sm overflow-hidden ${!excepcion.estado ? 'opacity-50' : ''
            }`}
        >
          {editingId === excepcion.id ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Editar Excepción</h3>
                <Button
                  onClick={() => setEditingId(null)}
                  variant={"ghost"}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <ExcepcionForm
                excepcion={excepcion}
                onClose={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {excepcion.motivo}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${excepcion.estado
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {excepcion.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Desde:</span>{' '}
                      {formatDate(excepcion.desde)}
                    </p>
                    <p>
                      <span className="font-medium">Hasta:</span>{' '}
                      {formatDate(excepcion.hasta)}
                    </p>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Creado: {formatDate(excepcion.createdAt)}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => setEditingId(excepcion.id)}
                    variant={"celeste"}
                    className="px-3 py-1 text-sm"
                    disabled={deletingId === excepcion.id}
                  >
                    Editar
                  </Button>

                  {excepcion.estado && (
                    <Button
                      onClick={() => handleSoftDelete(excepcion.id)}
                      variant={"amarillo"}
                      className="px-3 py-1 text-sm"
                      disabled={deletingId === excepcion.id}
                    >
                      {deletingId === excepcion.id ? 'Desactivando...' : 'Desactivar'}
                    </Button>
                  )}

                  <Button
                    onClick={() => handleDelete(excepcion.id)}
                    variant={"rojo"}
                    className="px-3 py-1 text-sm"
                    disabled={deletingId === excepcion.id}
                  >
                    {deletingId === excepcion.id ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}