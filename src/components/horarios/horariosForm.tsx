"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createMargenLaboral,
  updateMargenLaboral,
  type ActionState,
} from "@/actions/margenesHorario.actions";
import { toast } from "sonner";
import { Clock, CheckCircle2, Loader2, XCircle } from "lucide-react";

type HorariosFormProps = {
  diaId: string;
  initialData?: {
    id: string;
    estado: boolean;
    desde: string;  // ← Ahora es string "08:00"
    hasta: string;  // ← Ahora es string "17:00"
  } | null;
  onSuccess?: () => void;
  onCancel: () => void;
};

const initialState: ActionState = {
  success: false,
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="min-w-[120px] bg-cyan-500 hover:bg-cyan-600 text-white"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isEdit ? "Actualizar" : "Crear"}
        </>
      )}
    </Button>
  );
}

export function HorariosForm({
  diaId,
  initialData,
  onSuccess,
  onCancel,
}: HorariosFormProps) {
  const action = initialData ? updateMargenLaboral : createMargenLaboral;
  const [state, formAction] = useFormState(action, initialState);

  // Ya no necesita formatear, la hora ya es string "08:00"
  const formatTimeForInput = (hora: string) => {
    return hora; // "08:00" ya está en formato correcto
  };

  useEffect(() => {
    if (state.success) {
      toast.success(
        initialData
          ? "Horario actualizado correctamente"
          : "Horario creado correctamente"
      );
      onSuccess?.();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, initialData, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="diaId" value={diaId} />
      {initialData && <input type="hidden" name="id" value={initialData.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label
            htmlFor="desde"
            className="text-base font-semibold flex items-center gap-2 text-cyan-700"
          >
            <Clock className="h-4 w-4 text-cyan-600" />
            Desde
          </Label>
          <Input
            type="time"
            id="desde"
            name="desde"
            required
            defaultValue={
              initialData ? formatTimeForInput(initialData.desde) : "08:00"
            }
            className="border-2 border-cyan-300 h-12 text-base hover:border-cyan-500 transition-colors bg-white text-cyan-700 font-mono"
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="hasta"
            className="text-base font-semibold flex items-center gap-2 text-cyan-700"
          >
            <Clock className="h-4 w-4 text-cyan-600" />
            Hasta
          </Label>
          <Input
            type="time"
            id="hasta"
            name="hasta"
            required
            defaultValue={
              initialData ? formatTimeForInput(initialData.hasta) : "17:00"
            }
            className="border-2 border-cyan-300 h-12 text-base hover:border-cyan-500 transition-colors bg-white text-cyan-700 font-mono"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold text-cyan-700">
          Estado del Horario
        </Label>
        {/* Cambio realizado acá: bg-gradient-... reemplazado por bg-white */}
        <div className="flex items-center justify-between p-5 border-2 border-cyan-300 rounded-lg bg-white hover:border-cyan-500 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Label
                htmlFor="estado"
                className="text-base font-medium cursor-pointer text-cyan-700"
              >
                Horario Activo
              </Label>
            </div>
            <div className="text-sm text-cyan-600/80">
              {initialData?.estado ?? true ? (
                <span className="flex items-center gap-1 text-cyan-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Horario habilitado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-cyan-600/60">
                  <XCircle className="h-3 w-3" />
                  Horario deshabilitado
                </span>
              )}
            </div>
          </div>
          <Switch
            id="estado"
            name="estado"
            defaultChecked={initialData?.estado ?? true}
            value="true"
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border-2 border-red-300 p-4 rounded-lg">
          <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p>{state.error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4 border-t-2 border-cyan-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="min-w-[120px] border-2 border-cyan-300 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <SubmitButton isEdit={!!initialData} />
      </div>
    </form>
  );
}