import { getExcepciones } from "@/actions/excepcionesLaborales.actions";
import ExcepcionesClient from "@/components/excepcionesLaborales/ExcepcionesClient";
import SeccionHeader from "../SeccionHeader";

export const metadata = { title: "Feriados y excepciones" };

export default async function FeriadosPage() {
    const result = await getExcepciones();

    return (
        <div>
            <SeccionHeader
                titulo="Feriados y excepciones"
                descripcion="Días y horarios en los que no se trabaja. En esos rangos no se pueden reservar turnos."
            />
            {result.success ? (
                <ExcepcionesClient excepciones={result.data || []} />
            ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{result.error}</div>
            )}
        </div>
    );
}
