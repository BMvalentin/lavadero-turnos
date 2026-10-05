"use client";
import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";
import { useState, useEffect, use } from "react";
import { getHorariosCompactos } from "@/actions/margenesHorario.actions";
import { useSiteConfig } from "@/components/providers/SiteConfigProvider";
import { mapaEmbedUrl } from "@/lib/siteConfig";


export function LocationSection() {
  const config = useSiteConfig();
  const [cargando,setCargando] = useState(true);
  const [horarios,setHorarios] = useState(["Cargando..."]);
  useEffect(() => {
    try {
      getHorariosCompactos().then((res) => {
        if (res.length > 0 ) {
        setHorarios(res);
        } else {
          setHorarios(["Cerrado"]);
        }
    });
    }catch(error){
      setHorarios(["Error al cargar horarios"]);
    }finally{
      setCargando(false);
    }
  },[])
  return (
    <section id="ubicacion" className="py-20 md:py-32 bg-celeste/10 justify-center items-center mx-auto max-w-dvw  px-4 overflow-hidden">
      <div className="container justify-around items-center mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 justify-around items-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Nuestra <span className="text-celeste-dark">Ubicación</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Visitanos y dejá tu vehículo en las mejores manos.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center justify-center px-2 md:px-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 items-center justify-center w-full md:max-w-[35vw] mx-auto "
          >
            <div className="flex gap-4 p-6 rounded-xl bg-white border border-celeste/20 shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Dirección</h3>
                <p className="text-muted-foreground">{config.DIRECCION}</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl  bg-white border border-celeste/20  shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <Phone className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Teléfono</h3>
                <p className="text-muted-foreground">{config.TELEFONO}</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl  bg-white border border-celeste/20  shadow-2xl">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-celeste/15 flex items-center justify-center">
                <Clock className="w-6 h-6 text-celeste-dark" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Horarios</h3>
                {cargando ? (
                  <p className="text-muted-foreground">Cargando horarios...</p>
                ) : (
                  horarios.map((horario, index) => (
                    <p key={index} className="text-muted-foreground">
                      {horario}
                    </p>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl overflow-hidden border border-celeste/20 h-[400px] bg-white  shadow-2xl"
          >
            <iframe
              src={mapaEmbedUrl(config.DIRECCION)}
              width="600" 
              height="450" 
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación ${config.NOMBRE_EMPRESA}`}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
