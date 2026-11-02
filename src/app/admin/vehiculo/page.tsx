import { getVehiculos } from "@/actions/vehiculo-actions";
import VehiculoList from "@/components/vehiculo/VehiculoList";
import CreateVehiculoForm from "@/components/vehiculo/CreateVehiculoForm";
import EncabezadoPagina from "@/components/panel/EncabezadoPagina";
import ErrorCarga from "@/components/panel/ErrorCarga";

export const metadata = { title: "Vehículos" };

export default async function VehiculosPage() {
  const result = await getVehiculos();

  return (
    <div>
      <EncabezadoPagina titulo="Vehículos" descripcion="Tipos de vehículo que se pueden elegir al reservar." />

      <div className="mb-8">
        <CreateVehiculoForm />
      </div>

      {result.success && result.data ? (
        <VehiculoList vehiculos={result.data} />
      ) : (
        <ErrorCarga mensaje={result.error || "Error al cargar los vehículos"} />
      )}
    </div>
  );
}
