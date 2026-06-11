"use client";

import {
  createVehiculoXServicio,
  obtenerVehiculosYServicios,
} from "@/actions/vehiculoXServicio-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/useToast";

const initialState = {
  success: false,
  error: undefined,
  data: undefined,
};

type Vehiculo = {
  id: string;
  nombre: string | null;
};

type Servicio = {
  id: string;
  nombre: string | null;
};

export default function CreateVehiculoXServicioForm() {
  const [state, formAction] = useActionState(
    createVehiculoXServicio,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    async function cargarDatos() {
      try {
        const result = await obtenerVehiculosYServicios();
        if (result.success && result.data) {
          setVehiculos(
            Array.isArray(result.data.vehiculos) ? result.data.vehiculos : []
          );
          setServicios(
            Array.isArray(result.data.servicios) ? result.data.servicios : []
          );
        } else {
          setError(result.error || "Error al cargar datos");
        }
      } catch (err) {
        console.error("Error al cargar vehículos y servicios:", err);
        setError("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      addToast("Configuración creada exitosamente", "success");
    }
    if (state.error) {
      addToast("Error al crear la configuración", "error");
    }
  }, [state.success, state.error, addToast]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Cargando vehículos y servicios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <Button onClick={() => window.location.reload()} variant={"blanco"}>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  if (vehiculos.length === 0 || servicios.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-medium mb-2">
          ⚠️ No hay datos disponibles
        </p>
        <div className="text-yellow-700 text-sm space-y-1">
          {vehiculos.length === 0 && (
            <p>
              • No hay vehículos creados.{" "}
              <a href="/vehiculo" className="underline">
                Crear vehículos
              </a>
            </p>
          )}
          {servicios.length === 0 && (
            <p>
              • No hay servicios creados.{" "}
              <a href="/servicio" className="underline">
                Crear servicios
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Nueva Configuración</h2>

      <form ref={formRef} action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="id_vehiculo"
              className="block text-sm font-medium mb-1"
            >
              Tipo de Vehículo *
            </label>
            <select
              id="id_vehiculo"
              name="id_vehiculo"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un vehículo</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="id_servicio"
              className="block text-sm font-medium mb-1"
            >
              Servicio *
            </label>
            <select
              id="id_servicio"
              name="id_servicio"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione un servicio</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="duracionMinutos"
              className="block text-sm font-medium mb-1"
            >
              Duración (minutos) *
            </label>
            <input
              type="number"
              id="duracionMinutos"
              name="duracionMinutos"
              required
              min="1"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
            />
          </div>

          <div>
            <label
              htmlFor="precio"
              className="block text-sm font-medium mb-1"
            >
              Precio *
            </label>
            <input
              type="number"
              id="precio"
              name="precio"
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="descuento"
              className="block text-sm font-medium mb-1"
            >
              Descuento
            </label>
            <input
              type="number"
              id="descuento"
              name="descuento"
              min="0"
              step="0.01"
              defaultValue="0"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label
              htmlFor="senia"
              className="block text-sm font-medium mb-1"
            >
              Seña
            </label>
            <input
              type="number"
              id="senia"
              name="senia"
              min="0"
              step="0.01"
              defaultValue="0"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={pending ? "ghost" : "celeste"}
      disabled={pending}
      className="w-full disabled:cursor-not-allowed"
    >
      {pending ? "Creando..." : "Crear Configuración"}
    </Button>
  );
}