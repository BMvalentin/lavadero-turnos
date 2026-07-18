"use client";

import { useState, useTransition } from "react";
import { Plus, Sparkles } from "lucide-react";
import { DiaLaboralForm } from "@/components/diaLaboral/diaLaboralForm";
import { DiaLaboralList } from "@/components/diaLaboral/diaLaboralList";
import { HorariosList } from "@/components/horarios/horariosList";
import { deleteDiaLaboral } from "@/actions/diaLaboral.actions";
import { useConfirm } from "@/hooks/useConfirm";
import {
  deleteMargenLaboral,
  getMargenesLaborales,
} from "@/actions/margenesHorario.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type DiaLaboral = {
  id: string;
  estado: boolean;
  dia: number;
  createdAt: Date;
  updatedAt: Date;
  margenes?: any[];
};

type DiaLaboralClientProps = {
  initialData: DiaLaboral[];
};

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function DiaLaboralClient({ initialData }: DiaLaboralClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHorariosDialogOpen, setIsHorariosDialogOpen] = useState(false);
  const [editingDia, setEditingDia] = useState<DiaLaboral | null>(null);
  const [selectedDia, setSelectedDia] = useState<DiaLaboral | null>(null);
  const [margenes, setMargenes] = useState<any[]>([]);
  const { confirm } = useConfirm();

  const handleCreate = () => {
    setEditingDia(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (dia: DiaLaboral) => {
    setEditingDia(dia);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este día laboral? Esta acción no se puede deshacer."
    });
    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await deleteDiaLaboral(id);

      if (result.success) {
        toast.success("Día laboral eliminado correctamente");
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar el día laboral");
      }
    });
  };

  const handleAsignarHorarios = async (dia: DiaLaboral) => {
    setSelectedDia(dia);
    startTransition(async () => {
      try {
        const margenesData = await getMargenesLaborales(dia.id);
        setMargenes(margenesData);
        setIsHorariosDialogOpen(true);
      } catch (error) {
        toast.error("Error al cargar los horarios");
      }
    });
  };

  const handleDeleteMargen = async (margenId: string) => {
    const isConfirmed = await confirm({
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este horario? Esta acción no se puede deshacer."
    });
    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await deleteMargenLaboral(margenId);

      if (result.success) {
        toast.success("Horario eliminado correctamente");
        // Recargar márgenes
        if (selectedDia) {
          const margenesData = await getMargenesLaborales(selectedDia.id);
          setMargenes(margenesData);
        }
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar el horario");
      }
    });
  };

  const handleHorariosSuccess = async () => {
    if (selectedDia) {
      const margenesData = await getMargenesLaborales(selectedDia.id);
      setMargenes(margenesData);
    }
    router.refresh();
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingDia(null);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-between mb-6">
        <div className="flex flex-row flex-wrap gap-5">
          <Link href="/admin"><Button variant={"celeste"}>Gestionar Turnos</Button></Link>
          <Link href="/excepcionesLaborales"><Button variant={"rojo"}>Gestionar Feriados</Button></Link>
        </div>
        <Button
          onClick={handleCreate}
          variant={"celeste"}
          size="lg"
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          Nuevo Día Laboral
          <Sparkles className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <DiaLaboralList
        diasLaborales={initialData}
        isLoading={isPending}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAsignarHorarios={handleAsignarHorarios}
      />

      {/* Diálogo para crear/editar día laboral */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-4 border-cyan-400 shadow-2xl bg-[#f6fbff]">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 rounded-t-2xl" />

          <DialogHeader className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl border-2 border-cyan-300">
                <span className="text-3xl">{editingDia ? "✏️" : "✨"}</span>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-cyan-600">
                  {editingDia
                    ? "Editar Día Laboral"
                    : "Crear Nuevo Día Laboral"}
                </DialogTitle>
                <DialogDescription className="text-base mt-1.5 text-cyan-700/80">
                  {editingDia
                    ? "Modifica la configuración del día seleccionado"
                    : "Define un nuevo día laboral para tu calendario"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />

          <div className="py-2">
            <DiaLaboralForm
              initialData={editingDia}
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para asignar horarios */}
      <Dialog
        open={isHorariosDialogOpen}
        onOpenChange={setIsHorariosDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto border-4 border-cyan-400 shadow-2xl bg-white">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 rounded-t-2xl" />

          <div className="py-2">
            {selectedDia && (
              <HorariosList
                diaId={selectedDia.id}
                diaNombre={DIAS_SEMANA[selectedDia.dia]}
                margenes={margenes}
                onSuccess={handleHorariosSuccess}
                onDelete={handleDeleteMargen}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}