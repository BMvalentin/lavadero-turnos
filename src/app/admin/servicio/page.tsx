import { getServicios } from "@/actions/servicio-actions";
import ServicioList from "@/components/servicio/ServicioList";
import CreateServicioForm from "@/components/servicio/CreateServicioForm";
import EncabezadoPagina from "@/components/panel/EncabezadoPagina";
import ErrorCarga from "@/components/panel/ErrorCarga";

export const metadata = { title: "Servicios" };

export default async function ServiciosPage() {
  const result = await getServicios();

  return (
    <div>
      <EncabezadoPagina titulo="Servicios" descripcion="Creá y editá los servicios que ofrece el lavadero." />

      <div className="mb-8">
        <CreateServicioForm />
      </div>

      {result.success && result.data ? (
        <ServicioList servicios={result.data} />
      ) : (
        <ErrorCarga mensaje={result.error || "Error al cargar los servicios"} />
      )}
    </div>
  );
}
