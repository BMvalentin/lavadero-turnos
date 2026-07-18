import { obtenerConfiguracion } from "@/actions/configuracion.actions";
import ConfigForm from "./ConfigForm";
import Link from "next/link";

export const metadata = {
    title: "Configuración Global | Tu Lavadero",
};

export default async function ConfiguracionPage() {
    const whatsappOwnerNumber = await obtenerConfiguracion("WHATSAPP_OWNER_NUMBER") || "";

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link 
                    href="/admin"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Volver"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Configuración Global</h1>
                    <p className="text-gray-500 text-sm">Gestiona las variables del sistema.</p>
                </div>
            </div>

            <section className="mt-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Notificaciones de WhatsApp</h2>
                <ConfigForm initialValue={whatsappOwnerNumber} />
            </section>
        </div>
    );
}
