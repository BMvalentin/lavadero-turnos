"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

// ---------- Tipos y estilos ----------
interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  addToast: (message: string, type: ToastItem["type"]) => void;
  removeToast: (id: string) => void;
}

const typeStyles = {
  success: "bg-green-50 border-green-500 text-green-800",
  error: "bg-red-50 border-red-500 text-red-800",
  info: "bg-blue-50 border-blue-500 text-blue-800",
};

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

// ---------- Contexto ----------
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
};

// ---------- Componente Toast ----------
function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = iconMap[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 200 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      drag="x"
      dragConstraints={{ left: 0, right: 150 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100) onDismiss(toast.id);
      }}
      className={`pointer-events-auto flex items-center w-full max-w-sm p-4 rounded-lg shadow-lg border-l-4 ${typeStyles[toast.type]}`}
      role="alert"
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-2 p-1 rounded-full hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ---------- Provider ----------
export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem["type"]) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Contenedor de toasts */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}