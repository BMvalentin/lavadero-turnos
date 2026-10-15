import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { DiaLaboralClient } from "@/components/diaLaboral/diaLaboralClient";
import { getDiasLaborales } from "@/actions/diaLaboral.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DiaLaboralPage() {
  const session = await auth();
  if (!session?.user) { redirect("/login"); }
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl mt-20">
      {/* Header con gradiente */}
      <div className="mb-10">
        <div className="flex flex-row items-center gap-4 mb-4 align-middle">
          <div className="p-3 rounded-2xl">
            <Calendar className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold from-primary to-primary/60 bg-clip-text text-primary">
              Días Laborales
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Configura los días de la semana habilitados para trabajo
            </p>
          </div>
          
        </div>
        
        {/* Barra decorativa */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full" />
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DiaLaboralContent />
      </Suspense>
    </div>
  );
}

async function DiaLaboralContent() {
  const diasLaborales = await getDiasLaborales();

  return <DiaLaboralClient initialData={diasLaborales} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Skeleton className="h-11 w-48" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border-2 rounded-lg p-6 space-y-4 bg-gradient-to-br from-blue-200 to-blue-50">
            <div className="flex items-start gap-3">
              <Skeleton className="w-2 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}