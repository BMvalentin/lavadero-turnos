"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onAccept: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, onAccept, onCancel }: ConfirmDialogProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-center gap-3">
          <Button
            onClick={onCancel}
            variant="blanco"
            className="px-6 py-2"
          >
            Cancelar
          </Button>
          <Button
            onClick={onAccept}
            variant="celeste"
            className="px-6 py-2 bg-blue-600 text-white"
          >
            Aceptar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}