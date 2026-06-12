import Image from "next/image";
import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TurnoConRelaciones {
  id: string;
  horarioReservado: Date;
  patente: string;
  estado: number;
  precioCongelado: number;
  seniaCongelada: number;
  user: {
    name: string | null;
    email: string;
    telefono?: string | null;
    image: string | null;
  };
  vehiculo_servicio: {
    precio: number;
    servicio: { nombre: string | null } | null;
    vehiculo: { nombre: string | null } | null;
  };
}


interface TablaRenderProps {
  data: TurnoConRelaciones[];
  titulo: string;
  orderBy: string;
  orderDir: "asc" | "desc";
  handleSort: (field: string) => void;
  openModal: (id: string) => void;
}

export function TablaRender({
  data,
  titulo,
  orderBy,
  orderDir,
  handleSort,
  openModal,
}: TablaRenderProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-700 border-b pb-2 uppercase tracking-wider">
        {titulo}
      </h2>
      <div className="overflow-x-auto shadow-sm border rounded-lg bg-white">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="text-gray-700">
            <tr>
              <th
                className="p-2 border bg-gray-50 cursor-pointer hover:bg-blue-100"
                onClick={() => handleSort("horarioReservado")}
              >
                FECHA{" "}
                {orderBy === "horarioReservado"
                  ? orderDir === "asc" ? "▲" : "▼"
                  : "↕"}
              </th>
              <th className="p-2 border bg-gray-50">CLIENTE</th>
              <th className="p-2 border bg-gray-50">SERVICIO</th>
              <th className="p-2 border bg-gray-50 text-center">ESTADO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                  No hay turnos registrados aquí.
                </td>
              </tr>
            ) : (
              data.map((turno) => (
                <tr
                  key={turno.id}
                  className={`hover:bg-blue-50/40 transition-colors text-center border-l-8 border-solid
                    ${turno.estado === 0 ? "!border-l-red-500" : ""}
                    ${turno.estado === 1 ? "!border-l-yellow-500" : ""}
                    ${turno.estado === 2 ? "!border-l-green-500" : ""}
                  `}
                >
                  <td className="p-3 font-medium">
                    {new Date(turno.horarioReservado).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-2 text-left">
                    <div className="flex items-center gap-3">
                      <Image
                        src={turno.user.image || "/images/avatar-default.svg"}
                        alt="Avatar"
                        width={35}
                        height={35}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-semibold leading-none">
                          {turno.user.name || "Invitado"}
                        </div>
                        <div className="text-[11px] text-gray-500 mb-1">
                          {turno.user.email}
                        </div>
                        {turno.user.telefono && (
                          <Link
                            href={`https://wa.me/${turno.user.telefono.replace(/\D/g, "")}`}
                            target="_blank"
                            className="text-green-600 text-xs flex items-center gap-1 hover:underline"
                          >
                            <MessageCircleMore className="w-3 h-3" />{" "}
                            {turno.user.telefono}
                          </Link>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">
                      {turno.vehiculo_servicio.vehiculo?.nombre}
                    </div>
                    <div className="my-1">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                        {turno.vehiculo_servicio.servicio?.nombre}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] font-bold text-slate-700 uppercase">
                      {turno.patente}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col items-center gap-1">
                      {turno.estado === 0 && (
                        <span className="font-bold text-red-600 text-xs">
                          CANCELADO
                        </span>
                      )}
                      {turno.estado === 1 && (
                        <>
                          <span className="font-bold text-yellow-600 text-xs">
                            PENDIENTE
                          </span>
                          <Button
                            variant="amarillo"
                            size="sm"
                            className="h-7 text-[10px] px-2"
                            onClick={() => openModal(turno.id)}
                          >
                            Cambiar
                          </Button>
                        </>
                      )}
                      {turno.estado === 2 && (
                        <span className="font-bold text-green-600 text-xs">
                          COMPLETADO
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}