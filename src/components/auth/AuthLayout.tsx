import { motion } from "framer-motion";

interface AuthProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden"
    style={{
            backgroundImage: "url('/images/bglogin.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "right bottom",
            minWidth: "100vw",
            minHeight: "100vh",
        }}>
      {/* Luces de neón de fondo (Efecto velocidad) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      
      {/* Líneas de carretera abstractas */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-md px-4 md:pl-[26%]"
      >
        {children}
      </motion.div>
    </div>
  );
}