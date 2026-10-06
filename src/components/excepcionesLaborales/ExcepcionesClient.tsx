"use client";

import ExcepcionForm from "./ExcepcionesForm";
import ExcepcionesList from "./ExcepcionesList";

type Excepcion = {
  id: string;
  motivo: string;
  desde: Date;
  hasta: Date;
  estado: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ExcepcionesClientProps = {
  excepciones: Excepcion[];
};

export default function ExcepcionesClient({ excepciones }: ExcepcionesClientProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Formulario de creación */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold mb-4">Nueva Excepción</h2>
          <ExcepcionForm />
        </div>
      </div>

      {/* Lista de excepciones */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4">
            Excepciones Registradas ({excepciones.length})
          </h2>
          <ExcepcionesList excepciones={excepciones} />
        </div>
      </div>
    </div>
  );
}