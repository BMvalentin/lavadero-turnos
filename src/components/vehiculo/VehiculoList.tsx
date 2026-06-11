"use client";

import { deleteVehiculo } from "@/actions/vehiculo-actions";
import { useActionState, useEffect, useRef, useState } from "react";
import EditVehiculoModal from "./EditVehiculoModal";
import { Button } from "../ui/button";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

type Vehiculo = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
  createdAt: Date;
  vehiculo_servicio: any[];
};

export default function VehiculoList({ vehiculos }: { vehiculos: Vehiculo[] }) {
  if (vehiculos.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No hay vehículos disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehiculos.map((vehiculo) => (
        <VehiculoCard key={vehiculo.id} vehiculo={vehiculo} />
      ))}
    </div>
  );
}

function VehiculoCard({ vehiculo }: { vehiculo: Vehiculo }) {
  const [state, formAction] = useActionState(deleteVehiculo, initialState);
  const [showEditModal, setShowEditModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { confirm } = useConfirm();
  const { addToast } = useToast();

  // Mostrar toasts según el resultado de la acción
  useEffect(() => {
    if (state.success) {
      addToast("✅ Vehículo dado de baja exitosamente", "success");
    }
    if (state.error) {
      addToast(`❌ ${state.error}`, "error");
    }
  }, [state.success, state.error, addToast]);

  // Manejar el clic en "Dar de baja"
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Evita que el botón envíe el form directamente
    const ok = await confirm({
      title: "Dar de baja vehículo",
      message:
        "¿Estás seguro de que querés dar de baja este vehículo? Esta acción no se puede deshacer.",
    });
    if (ok) {
      formRef.current?.requestSubmit(); // Envía el formulario manualmente
    }
  };

  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    if (url.startsWith("http://") || url.startsWith("https://")) return true;
    if (url.startsWith("/")) return true;
    return false;
  };

  const hasValidImage = isValidImageUrl(vehiculo.srcImage);

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          {hasValidImage ? (
            <img
              src={vehiculo.srcImage!}
              alt={vehiculo.nombre || "Vehículo"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Sin imagen</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            {vehiculo.nombre || "Sin nombre"}
          </h3>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>{vehiculo.vehiculo_servicio.length} servicio(s)</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                vehiculo.estado
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {vehiculo.estado ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowEditModal(true)}
              variant={"celeste"}
              className="flex-1"
            >
              Editar
            </Button>

            <form ref={formRef} action={formAction}>
              <input type="hidden" name="id" value={vehiculo.id} />
              <Button
                type="submit"
                variant={"rojo"}
                onClick={handleDelete}
              >
                Dar de baja
              </Button>
            </form>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditVehiculoModal
          vehiculo={vehiculo}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}