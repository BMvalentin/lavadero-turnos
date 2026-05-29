import { getVehiculos } from "@/actions/vehiculo-actions";
import VehiculoList from "@/components/vehiculo/VehiculoList";  
import CreateVehiculoForm from "@/components/vehiculo/CreateVehiculoForm";  
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VehiculosPage() {  
    const session = await auth();
    if (!session?.user) { redirect("/login"); }
    const result = await getVehiculos();

    return (
        <div className="container mx-auto p-6 max-w-7xl mt-20">

            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="flex flex-col md:flex-row gap-5">
                    <h1 className="text-3xl font-bold mb-2">Gestión de Vehículos</h1>
                    <p className="text-gray-600">
                        Administra los tipos de vehículos disponibles para tus servicios
                    </p>
                </div>
            </div>

           
            <div className="mb-8">
                <CreateVehiculoForm /> 
            </div>

      
            <Suspense fallback={<LoadingSkeleton />}>
                {result.success && result.data ? (
                    <VehiculoList vehiculos={result.data} />
                ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">
                            {result.error || "Error al cargar los vehículos"}
                        </p>
                    </div>
                )}
            </Suspense>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );
}