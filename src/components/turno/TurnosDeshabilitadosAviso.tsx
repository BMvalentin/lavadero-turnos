import { CalendarOff } from "lucide-react";

// Se muestra a los clientes cuando el admin desactivó la reserva de turnos.
export default function TurnosDeshabilitadosAviso({ telefono }: { telefono?: string }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 max-w-4xl mx-auto flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <CalendarOff className="w-6 h-6" />
            </div>
            <div className="space-y-1">
                <h2 className="text-lg font-bold text-gray-800">Reservas pausadas</h2>
                <p className="text-sm text-gray-600">
                    Por el momento no estamos tomando turnos desde la web. Volvé a intentarlo más tarde
                    {telefono ? <> o comunicate con nosotros al <strong>{telefono}</strong></> : null}.
                </p>
            </div>
        </div>
    );
}
