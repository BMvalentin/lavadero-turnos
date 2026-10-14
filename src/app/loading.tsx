export default function Loading() {
  return (
    // El 'fixed inset-0' asegura que cubra TODA la pantalla
    // 'bg-white/60' da la transparencia y 'backdrop-blur' el efecto borroso
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity">
      
      {/* Círculo de carga con los colores de tu lavadero */}
      <div className="relative flex items-center justify-center">
        {/* Círculo exterior animado */}
        <div className="h-20 w-20 animate-spin rounded-full border-4 border-gray-200 border-t-celeste"></div>
        
        {/* Un detalle: icono de auto o punto en el medio */}
        <div className="absolute text-2xl">🚗</div>
      </div>

      <h2 className="mt-4 text-lg font-semibold text-gray-700 animate-pulse">
        Cargando datos...
      </h2>
    </div>
  );
}