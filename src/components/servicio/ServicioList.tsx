"use client";

import { deleteservicio } from "@/actions/servicio-actions";
import { useActionState, useEffect, useRef, useState } from "react";
import EditServicioModal from "./EditServicioModal";
import { Button } from "../ui/button";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

type Servicio = {
  id: string;
  nombre: string | null;
  srcImage: string | null;
  estado: boolean;
  createdAt: Date;
  vehiculo_servicio: any[];
};

export default function ServicioList({ servicios }: { servicios: Servicio[] }) {
  if (servicios.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No hay servicios disponibles</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servicios.map((servicio) => (
        <ServicioCard key={servicio.id} servicio={servicio} />
      ))}
    </div>
  );
}

function ServicioCard({ servicio }: { servicio: Servicio }) {
  const [state, formAction] = useActionState(deleteservicio, initialState);
  const [showEditModal, setShowEditModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { confirm } = useConfirm();
  const { addToast } = useToast();

  // Mostrar toasts según el resultado de la acción
  useEffect(() => {
    if (state.success) {
      addToast("Servicio dado de baja exitosamente", "success");
    }
    if (state.error) {
      addToast("Error al dar de baja el servicio", "error");
    }
  }, [state.success, state.error, addToast]);

  // Manejar el clic en "Dar de baja"
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Evita que el botón envíe el form directamente
    const ok = await confirm({
      title: "Dar de baja servicio",
      message: "¿Estás seguro de que querés dar de baja este servicio? Esta acción no se puede deshacer.",
    });
    if (ok) {
      formRef.current?.requestSubmit(); // Envía el formulario manualmente
    }
  };

  // Validar si la imagen es válida
  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    if (url.startsWith("http://") || url.startsWith("https://")) return true;
    if (url.startsWith("/")) return true;
    return false;
  };

  const hasValidImage = isValidImageUrl(servicio.srcImage);

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        {/* Imagen */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          {hasValidImage ? (
            <img
              src={servicio.srcImage!}
              alt={servicio.nombre || "Servicio"}
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Sin imagen</p>
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            {servicio.nombre || "Sin nombre"}
          </h3>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>{servicio.vehiculo_servicio.length} vehículo(s)</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${servicio.estado
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {servicio.estado ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowEditModal(true)}
              variant={"celeste"}
              className="flex-1"
            >
              Editar
            </Button>

            <form ref={formRef} action={formAction}>
              <input type="hidden" name="id" value={servicio.id} />
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

      {/* Modal de edición */}
      {showEditModal && (
        <EditServicioModal
          servicio={servicio}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}