"use client";

import { useState } from "react";
import { Clock, Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HorariosForm } from "@/components/horarios/horariosForm";

type MargenLaboral = {
  id: string;
  diaId: string;
  estado: boolean;
  desde: string;  // ← Ahora es string "08:00"
  hasta: string;  // ← Ahora es string "17:00"
  createdAt: Date;
  updatedAt: Date;
};

type HorariosListProps = {
  diaId: string;
  diaNombre: string;
  margenes: MargenLaboral[];
  onSuccess: () => void;
  onDelete: (id: string) => void;
};

export function HorariosList({
  diaId,
  diaNombre,
  margenes,
  onSuccess,
  onDelete,
}: HorariosListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMargen, setEditingMargen] = useState<MargenLaboral | null>(null);

  const handleCreate = () => {
    setEditingMargen(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (margen: MargenLaboral) => {
    setEditingMargen(margen);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingMargen(null);
    onSuccess();
  };

  // Ya no necesita formatear, solo retorna el string directamente
  const formatTime = (hora: string) => {
    return hora; // "08:00" ya está en formato correcto
  };

  return (
    /* Cambio: Forzamos bg-white en el contenedor principal del componente */
    <div className="space-y-4 bg-white p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-cyan-600" />
          <h3 className="text-lg font-semibold text-cyan-700">
            Horarios - {diaNombre}
          </h3>
          {margenes.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {margenes.length} {margenes.length === 1 ? "horario" : "horarios"}
            </Badge>
          )}
        </div>
        <Button
          onClick={handleCreate}
          size="sm"
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Horario
        </Button>
      </div>

      {margenes.length === 0 ? (
        /* Cambio realizado acá: Añadido bg-white explícito para limpiar la tarjeta punteada de la imagen */
        <div className="border-2 border-dashed border-cyan-200 rounded-lg p-8 text-center bg-white">
          <Clock className="h-12 w-12 text-cyan-300 mx-auto mb-3" />
          <p className="text-cyan-600 font-medium mb-1">
            No hay horarios definidos
          </p>
          <p className="text-sm text-cyan-500">
            Agrega horarios para este día laboral
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {margenes.map((margen) => (
            <div
              key={margen.id}
              className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                margen.estado
                  ? "border-cyan-300 bg-white"
                  : "border-gray-300 bg-gray-50/50 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    margen.estado
                      ? "bg-cyan-100 text-cyan-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-semibold text-cyan-700">
                      {formatTime(margen.desde)}
                    </span>
                    <span className="text-cyan-500">→</span>
                    <span className="font-mono text-lg font-semibold text-cyan-700">
                      {formatTime(margen.hasta)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {margen.estado ? (
                      <Badge className="bg-cyan-500 hover:bg-cyan-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                  onClick={() => handleEdit(margen)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(margen.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] border-4 border-cyan-400 shadow-2xl bg-white">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 rounded-t-2xl" />

          <DialogHeader className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl border-2 border-cyan-300">
                <Clock className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-cyan-600">
                  {editingMargen ? "Editar Horario" : "Nuevo Horario"}
                </DialogTitle>
                <DialogDescription className="text-base mt-1.5 text-cyan-700/80">
                  {diaNombre} - {editingMargen ? "Modifica el horario" : "Define un nuevo horario"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

          <div className="py-2">
            <HorariosForm
              diaId={diaId}
              initialData={editingMargen}
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}