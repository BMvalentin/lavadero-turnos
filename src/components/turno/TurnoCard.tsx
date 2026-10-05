"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-dom";
import { deleteTurno, completedTurno } from "@/actions/turno.actions";
import EditTurnoModal from "./EditarTurnoModal";
import { Button } from "../ui/button";

const initialState = {
    success: false,
    error: undefined,
    data: { id: "", whatsappUrl: "" }
};

// Modal reutilizable para forzar la acción
function NotificationModal({ url, message, onClose }: { url: string; message: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
                <h3 className="text-xl font-bold text-gray-800">¡Acción completada!</h3>
                <p className="text-gray-600 text-sm">{message}</p>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="block bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#128C7E] transition-all shadow-md w-full"
                >
                    Enviar por WhatsApp
                </a>
            </div>
        </div>
    );
}

export default function TurnoCard({ session, turno }: { session: any; turno: any }) {
    const router = useRouter();
    const [state, formAction] = useFormState(deleteTurno, initialState);
    const [stateComplete, formActionComplete] = useFormState(completedTurno, initialState);
    const [showEditModal, setShowEditModal] = useState(false);

    const formatFecha = (fecha: Date) => new Date(fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const formatPrecio = (precio: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);

    const fechaTurno = new Date(turno.horarioReservado);
    const hoy = new Date();
    const isPasado = fechaTurno < hoy;
    const isHoy = fechaTurno.toDateString() === hoy.toDateString();

    return (
        <>
            {/* MODALES DE NOTIFICACIÓN OBLIGATORIA */}
            {state.success && (
                <NotificationModal 
                    url={state.data.whatsappUrl} 
                    message="El turno ha sido cancelado. Debes notificar al cliente obligatoriamente."
                    onClose={() => router.refresh()}
                />
            )}
            {stateComplete.success && (
                <NotificationModal 
                    url={stateComplete.data.whatsappUrl} 
                    message="El turno se ha completado. Envía la confirmación al cliente por WhatsApp."
                    onClose={() => router.refresh()}
                />
            )}

            <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden ${isPasado ? 'opacity-75' : ''}`}>
                <div className={`p-4 text-white ${isPasado ? 'bg-gray-500' : isHoy ? 'bg-green-700' : 'bg-[#6fa9da]'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">{isPasado ? '🕐 Pasado' : isHoy ? '📅 Hoy' : '📅 Próximo'}</p>
                            <p className="font-bold text-lg">{formatFecha(fechaTurno)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Patente</p>
                            <p className="font-bold text-xl">{turno.patente}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">Cliente</p>
                        <p className="font-semibold text-gray-800">{turno.user.name}</p>
                    </div>
                    <div className="border-t pt-3">
                        <p className="font-semibold text-gray-800">{turno.vehiculo_servicio.vehiculo.nombre} - {turno.vehiculo_servicio.servicio.nombre}</p>
                    </div>

                    <div className="border-t pt-3 grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Precio Total</p>
                            <p className="font-bold text-green-600 text-sm">{formatPrecio(turno.precioCongelado)}</p>
                        </div>
                        {turno.seniaCongelada > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Seña</p>
                                <p className="font-bold text-blue-600 text-sm">{formatPrecio(turno.seniaCongelada)}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-3">
                        {session?.user.role === "ADMIN" && isPasado && (
                            <form action={formActionComplete}>
                                <input type="hidden" name="id" value={turno.id} />
                                <Button type="submit" variant="verde" className="flex-1 text-sm">Completar</Button>
                            </form>
                        )}
                        <Button onClick={() => setShowEditModal(true)} variant="celeste" className="flex-1 text-sm">Editar</Button>
                        <form action={formAction}>
                            <input type="hidden" name="id" value={turno.id} />
                            <Button type="submit" variant="rojo" className="text-sm">Cancelar</Button>
                        </form>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditTurnoModal session={session} turno={turno} onClose={() => setShowEditModal(false)} />
            )}
        </>
    );
}