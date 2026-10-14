"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Car, Calendar, Clock, Phone, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FechaInput from "@/components/ui/FechaInput";
import { formatValorInput } from "@/lib/fechas";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const vehicleTypes = [
  { id: "auto", label: "Auto", icon: "🚗" },
  { id: "camioneta", label: "Camioneta", icon: "🚙" },
  { id: "moto", label: "Moto", icon: "🏍️" },
];

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00",
];

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleType: "",
    date: "",
    time: "",
    phone: "",
  });

  const handleSubmit = () => {
    if (!formData.vehicleType || !formData.date || !formData.time || !formData.phone) {
      toast.error("Por favor completá todos los campos");
      return;
    }
    
    toast.success("¡Turno reservado con éxito!", {
      description: `Te esperamos el ${formatValorInput(formData.date)} a las ${formData.time}`,
    });
    
    setStep(4);
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({ vehicleType: "", date: "", time: "", phone: "" });
    onClose();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={resetAndClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white border border-border rounded-2xl shadow-elevated overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {step === 4 ? "¡Listo!" : "Reservar Turno"}
                </h2>
                {step < 4 && (
                  <p className="text-sm text-muted-foreground">Paso {step} de 3</p>
                )}
              </div>
              <button
                onClick={resetAndClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Car className="w-4 h-4" />
                      <span>Seleccioná el tipo de vehículo</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {vehicleTypes.map((type) => (
                        <Button
                          key={type.id}
                          onClick={() => {
                            setFormData({ ...formData, vehicleType: type.id });
                            setStep(2);
                          }}
                          variant={`${
                            formData.vehicleType === type.id
                              ? "celeste"
                              : "blanco"
                          }`}
                          className={`p-4 rounded-xl border-2`}
                        >
                          <span className="text-3xl block mb-2">{type.icon}</span>
                          <span className="text-sm font-medium text-foreground">{type.label}</span>
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Elegí día y horario</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Fecha</label>
                      <FechaInput
                        min={today}
                        value={formData.date}
                        onChange={(date) => setFormData({ ...formData, date })}
                        className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground focus-within:border-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Horario
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={`${
                              formData.time === time
                                ? "celeste"
                                : "blanco"
                            }`}
                            size="sm"
                            onClick={() => setFormData({ ...formData, time })}
                            className={`p-2 rounded-lg text-sm font-medium transition-all`}>
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Atrás
                      </Button>
                      <Button
                        variant="celeste"
                        onClick={() => formData.date && formData.time && setStep(3)}
                        disabled={!formData.date || !formData.time}
                        className="flex-1"
                      >
                        Continuar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Phone className="w-4 h-4" />
                      <span>Tu número de contacto</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Teléfono</label>
                      <input
                        type="tel"
                        placeholder="Ej: 11 1234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">Resumen</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Vehículo: {vehicleTypes.find(v => v.id === formData.vehicleType)?.label}</p>
                        <p>Fecha: {formData.date}</p>
                        <p>Hora: {formData.time}</p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Atrás
                      </Button>
                      <Button
                        variant="celeste"
                        onClick={handleSubmit}
                        disabled={!formData.phone}
                        className="flex-1"
                      >
                        Confirmar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      ¡Turno Confirmado!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Te esperamos el {formData.date} a las {formData.time}
                    </p>
                    <Button variant="celeste" onClick={resetAndClose}>
                      Cerrar
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
