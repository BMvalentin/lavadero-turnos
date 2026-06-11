"use client";

import { deleteVehiculoXServicio } from "@/actions/vehiculoXServicio-actions";
import { useActionState, useEffect, useRef, useState } from "react";
import EditVehiculoXServicioModal from "./EditVehiculoXServicioModal";
import Image from "next/image";
import { Button } from "../ui/button";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

type VehiculoXServicio = {
  id: string;
  vehiculoId: string;
  servicioId: string;
  duracion: number;
  precio: number;
  descuento: number;
  senia: number;
  estado: boolean;
  createdAt: Date;
  vehiculo: {
    id: string;
    nombre: string | null;
    srcImage: string | null;
  };
  servicio: {
    id: string;
    nombre: string | null;
    srcImage: string | null;
  };
};

export default function VehiculoXServicioList({
  items,
}: {
  items: VehiculoXServicio[];
}) {
  if (!Array.isArray(items)) {
    console.error("VehiculoXServicioList: items no es un array", items);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: datos inválidos</p>
        <pre className="text-xs mt-2">{JSON.stringify(items, null, 2)}</pre>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No hay configuraciones disponibles</p>
        <p className="text-sm text-gray-500 mt-2">
          Crea una nueva configuración para vincular un vehículo con un servicio
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <VehiculoXServicioCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function VehiculoXServicioCard({ item }: { item: VehiculoXServicio }) {
  const [state, formAction] = useActionState(
    deleteVehiculoXServicio,
    initialState
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { confirm } = useConfirm();
  const { addToast } = useToast();

  useEffect(() => {
    if (state.success) {
      addToast("✅ Configuración eliminada exitosamente", "success");
    }
    if (state.error) {
      addToast(`❌ ${state.error}`, "error");
    }
  }, [state.success, state.error, addToast]);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const ok = await confirm({
      title: "Eliminar configuración",
      message:
        "¿Estás seguro de que querés eliminar esta configuración? Esta acción no se puede deshacer.",
    });
    if (ok) {
      formRef.current?.requestSubmit();
    }
  };

  const formatPrecio = (precio: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(precio);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-50 to-slate-200 p-4 text-slate-900 flex flex-row items-center justify-between gap-4 overflow-hidden">
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg mb-1">
              {item.vehiculo.nombre}
            </h3>
            <p className="text-slate-600 text-sm">{item.servicio.nombre}</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            {item.vehiculo.srcImage && (
              <Image
                src={item.vehiculo.srcImage}
                alt={item.vehiculo.nombre || "Imagen del vehículo"}
                width={64}
                height={48}
                className="rounded-full border-2 border-white w-16 h-12 object-cover"
              />
            )}
            {item.servicio.srcImage && (
              <Image
                src={item.servicio.srcImage}
                alt={item.servicio.nombre || "Imagen del servicio"}
                width={64}
                height={48}
                className="rounded-full border-2 border-white w-16 h-12 object-cover"
              />
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Duración:</span>
              <span className="font-semibold">{item.duracion} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Precio:</span>
              <span className="font-semibold text-green-600">
                {formatPrecio(item.precio)}
              </span>
            </div>
            {item.descuento > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Descuento:</span>
                <span className="font-semibold text-orange-600">
                  {formatPrecio(item.descuento)}
                </span>
              </div>
            )}
            {item.senia > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Seña:</span>
                <span className="font-semibold text-blue-600">
                  {formatPrecio(item.senia)}
                </span>
              </div>
            )}
            {item.descuento > 0 && (
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm font-medium text-gray-700">
                  Precio Final:
                </span>
                <span className="font-bold text-lg text-green-700">
                  {formatPrecio(item.precio - item.descuento)}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setShowEditModal(true)}
              variant={"celeste"}
              className="flex-1 text-sm font-medium"
            >
              Editar
            </Button>

            <form ref={formRef} action={formAction}>
              <input type="hidden" name="id" value={item.id} />
              <Button
                type="submit"
                variant="rojo"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium"
              >
                Eliminar
              </Button>
            </form>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditVehiculoXServicioModal
          item={item}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}