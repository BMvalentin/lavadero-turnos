"use client";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getVehiculosConServicios } from "@/actions/servicio-actions";
import { Button } from "./ui/button";

type ServicioData = {
  src: string;
  alt: string;
  title: string;
  precio: number; // Agregado por si quieres mostrarlo
};

type Vehiculo = {
  id: string;
  nombre: string;
  srcVehiculo: string;
  servicios: ServicioData[];
};

export function ImageCarousel() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [selectedVehiculoId, setSelectedVehiculoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const respuesta = await getVehiculosConServicios();
        
        if (respuesta.success && respuesta.data) {
          // Mapeamos la respuesta compleja de Prisma a algo más simple para el frontend
          const vehiculosMapeados = respuesta.data.map((vehiculo: any) => ({
            id: vehiculo.id,
            nombre: vehiculo.nombre,
            srcVehiculo: vehiculo.srcImage,
            servicios: vehiculo.vehiculo_servicio.map((vs: any) => ({
              src: vs.servicio.srcImage,
              alt: vs.servicio.nombre,
              title: vs.servicio.nombre,
              precio: Number(vs.precio),
            })),
          }));

          setVehiculos(vehiculosMapeados);
          
          // Seleccionamos el primer vehículo por defecto si existe
          if (vehiculosMapeados.length > 0) {
            setSelectedVehiculoId(vehiculosMapeados[0].id);
          }
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatos();
  }, []);

  // Servicios del vehículo seleccionado
  const vehiculoActual = vehiculos.find(v => v.id === selectedVehiculoId);
  const serviciosAMostrar = vehiculoActual ? vehiculoActual.servicios : [];
  const hasEnoughImages = serviciosAMostrar.length >= 3;

  return (
    <section id="servicios" className="py-20 md:py-32 bg-secundario mx-auto px-4">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Nuestros <span className="text-celeste-dark">Servicios</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Selecciona tu tipo de vehículo para ver los servicios disponibles.
          </p>
        </motion.div>

        {/* SELECTOR DE VEHÍCULOS */}
        {!isLoading && vehiculos.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {vehiculos.map((vehiculo) => {
              const isSelected = selectedVehiculoId === vehiculo.id;
              
              return (
                <div key={vehiculo.id}>
                  <Button
                    onClick={() => setSelectedVehiculoId(vehiculo.id)}
                    variant={"celeste"}
                    // No agregar key a este componente, para que no se destruya y pierda su estado interno (como la animación de layout) al hacer click
                    className={`flex flex-row px-6 py-2.5 rounded-full font-semibold transition-all duration-500 items-center min-h-[65px] gap-3 overflow-hidden ${
                      isSelected
                        ? "shadow-lg scale-105"
                        : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
                    }`}
                  >
                    {/* layout: activa la animación de reordenamiento.
                      transition: controla la duración y el tipo de curva (spring o tween).
                    */}
                    <motion.div 
                      layout 
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="flex items-center gap-3"
                      style={{ flexDirection: isSelected ? 'row' : 'row-reverse' }}
                    >
                      <motion.span layout transition={{ duration: 0.4 }}>
                        {vehiculo.nombre}
                      </motion.span>

                      <motion.div 
                        layout 
                        transition={{ duration: 0.4 }}
                        className="relative"
                      >
                        <Image 
                          src={vehiculo.srcVehiculo || "/images/logopng.png"} 
                          alt={vehiculo.nombre} 
                          width={48} 
                          height={48} 
                          className="rounded-full object-cover w-12 h-12 shadow-md drop-shadow-md shadow-black" 
                        />
                      </motion.div>
                    </motion.div>
                  </Button>
                </div>
              );
            })}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {isLoading ? (
            // ESTADO DE CARGA
            <div className="w-full max-w-5xl mx-auto h-[300px] bg-gray-200/50 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-gray-500 font-medium">Cargando servicios...</span>
            </div>
          ) : serviciosAMostrar.length === 0 ? (
            // ESTADO VACÍO (Vehículo sin servicios)
            <div className="w-full max-w-5xl mx-auto h-[300px] bg-white rounded-xl flex items-center justify-center shadow-sm text-center p-6">
              <span className="text-gray-500 text-lg">Próximamente agregaremos servicios para {vehiculoActual?.nombre}.</span>
            </div>
          ) : (
            // CARRUSEL
            <Carousel
              key={selectedVehiculoId} // Clave para forzar el re-render del carrusel al cambiar de vehículo (evita bugs visuales)
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent className="-ml-4">
                {serviciosAMostrar.map((servicio, index) => (
                  <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="group relative overflow-hidden rounded-xl aspect-[4/3] shadow-[0_10px_40px_-10px_hsl(210,25%,10%/0.3)]">
                      <Image
                        src={servicio.src || "/images/logopng.png"} // Fallback por si no hay imagen
                        alt={servicio.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1">
                        <h3 className="text-xl font-bold text-white">{servicio.title}</h3>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Flechas condicionales */}
              {hasEnoughImages && (
                <>
                  <CarouselPrevious className="hidden md:flex -left-12 bg-white border-border hover:bg-amber-500 hover:text-white" />
                  <CarouselNext className="hidden md:flex -right-12 bg-white border-border hover:bg-amber-500 hover:text-white" />
                </>
              )}
            </Carousel>
          )}
        </motion.div>
      </div>
    </section>
  );
}