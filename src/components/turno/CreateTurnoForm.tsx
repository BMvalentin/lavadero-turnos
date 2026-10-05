"use client";

import { createTurno, obtenerDatosParaTurno } from "@/actions/turno.actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SeleccionadorHorario from "./SeleccionadorHorario";
import { Button } from "../ui/button";

type VehiculoServicioData = {
    id: string;
    vehiculo: { nombre: string | null };
    servicio: { nombre: string | null };
    precio: number;
    duracion: number;
};

type UsuarioData = {
    id: string;
    name: string | null;
    email: string | null;
};

const initialState = {
    success: false,
    error: undefined,
    data: undefined,
};

function SuccessModal({ whatsappLink, onClose }: { whatsappLink: string | null; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
                <h3 className="text-xl font-bold text-gray-800">¡Turno reservado!</h3>
                <p className="text-gray-600 text-sm">Para finalizar, es obligatorio notificar al lavadero por WhatsApp:</p>
                
                <a
                    href={whatsappLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="block bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#128C7E] transition-all shadow-md"
                >
                    Enviar a WhatsApp
                </a>
            </div>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full md:w-auto md:min-w-50"
            variant={pending ? "ghost" : "celeste"}
        >
            {pending ? "Procesando..." : "Confirmar Reserva"}
        </Button>
    );
}

export default function CreateTurnoForm({ session }: { session: any }) {
    const router = useRouter();
    const [state, formAction] = useActionState(createTurno, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [configuraciones, setConfiguraciones] = useState<VehiculoServicioData[]>([]);
    const [usuarios, setUsuarios] = useState<UsuarioData[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedConfigId, setSelectedConfigId] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UsuarioData | null>(
        session.user.role === "USER" ? { id: session.user.id, name: session.user.name, email: session.user.email } : null
    );
    const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            const res = await obtenerDatosParaTurno();
            if (isMounted) {
                if (res.success && res.data) {
                    setConfiguraciones(res.data.configuraciones as any);
                    setUsuarios(res.data.usuarios as any);
                }
                setLoadingData(false);
            }
        }
        load();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            isMounted = false;
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredUsuarios = usuarios.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (state.success) {
            if (state.data?.whatsappUrl) {
                setWhatsappLink(state.data.whatsappUrl);
            }
            setShowSuccessModal(true);
            formRef.current?.reset();
            setSelectedConfigId("");
            if (session.user.role === "ADMIN") {
                setSelectedUser(null);
                setSearchTerm("");
            }
        }
    }, [state, session.user.role]);

    if (loadingData) return <div className="p-8 text-center text-gray-500">Cargando datos del sistema...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Turno</h2>

            {showSuccessModal && (
                <SuccessModal 
                    whatsappLink={whatsappLink} 
                    onClose={() => {
                        setShowSuccessModal(false);
                        router.refresh();
                    }} 
                />
            )}

            <form ref={formRef} action={formAction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 relative" ref={dropdownRef}>
                        <label className="text-sm font-medium text-gray-700">Cliente</label>
                        {session.user.role === "USER" ? (
                            <div className="p-2.5 bg-gray-50 border rounded-lg text-gray-700 font-medium">
                                {session.user.name || "Mi Cuenta"}
                                <input type="hidden" name="userId" value={session.user.id} />
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    value={selectedUser ? selectedUser.name || "" : searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (selectedUser) setSelectedUser(null);
                                        setShowUserDropdown(true);
                                    }}
                                    onFocus={() => setShowUserDropdown(true)}
                                    className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                />
                                <input type="hidden" name="userId" value={selectedUser?.id || ""} required />
                                {selectedUser && (
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedUser(null); setSearchTerm(""); }}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                                    >✕</button>
                                )}
                                {showUserDropdown && !selectedUser && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredUsuarios.length > 0 ? (
                                            filteredUsuarios.map(u => (
                                                <div
                                                    key={u.id}
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setShowUserDropdown(false);
                                                        setSearchTerm("");
                                                    }}
                                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-none"
                                                >
                                                    <p className="font-semibold text-sm text-gray-800">{u.name}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">No se encontraron clientes</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="vehiculoServicioId" className="text-sm font-medium text-gray-700">Servicio</label>
                        <select
                            name="vehiculoServicioId"
                            id="vehiculoServicioId"
                            required
                            className="w-full p-2.5 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setSelectedConfigId(e.target.value)}
                            value={selectedConfigId}
                        >
                            <option value="">-- Seleccionar Vehículo y Servicio --</option>
                            {configuraciones.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.vehiculo.nombre} | {c.servicio.nombre} — ${c.precio}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="patente" className="text-sm font-medium text-gray-700">Patente</label>
                        <input
                            type="text"
                            name="patente"
                            id="patente"
                            required
                            maxLength={10}
                            placeholder="AA123BB"
                            className="w-full p-2.5 border rounded-lg bg-gray-50 uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <hr className="border-gray-100" />
                <SeleccionadorHorario name="horarioReservado" vehiculoServicioId={selectedConfigId} />

                {state.error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {state.error}
                    </div>
                )}
                <SubmitButton />
            </form>
        </div>
    );
}