import { obtenerVehiculosXServicios } from "@/actions/vehiculoXServicio-actions";
import VehiculoXServicioList from "@/components/vehiculoXServicio/VehiculoXServicioList";
import CreateVehiculoXServicioForm from "@/components/vehiculoXServicio/CreateVehiculoXServicioForm";
import EncabezadoPagina from "@/components/panel/EncabezadoPagina";
import ErrorCarga from "@/components/panel/ErrorCarga";

export const metadata = { title: "Servicios por vehículo" };

export default async function VehiculoXServicioPage() {
  const result = await obtenerVehiculosXServicios();

  return (
    <div>
      <EncabezadoPagina
        titulo="Servicios por vehículo"
        descripcion="Asigná qué servicios se ofrecen para cada tipo de vehículo."
      />

      <div className="mb-8">
        <CreateVehiculoXServicioForm />
      </div>

      {result.success && result.data ? (
        <VehiculoXServicioList items={result.data} />
      ) : (
        <ErrorCarga mensaje={result.error || "Error al cargar las configuraciones"} />
      )}
    </div>
  );
}
