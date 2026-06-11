"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ConfirmDialog from "./ConfirmDialog";

interface ConfirmOptions {
  title: string;
  message: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm debe usarse dentro de ConfirmProvider");
  return context;
};

export default function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    ({ title, message }: ConfirmOptions): Promise<boolean> =>
      new Promise((resolve) => {
        setModal({ title, message, resolve });
      }),
    []
  );

  const handleClose = (result: boolean) => {
    modal?.resolve(result);
    setModal(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {modal && (
          <ConfirmDialog
            title={modal.title}
            message={modal.message}
            onAccept={() => handleClose(true)}
            onCancel={() => handleClose(false)}
          />
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}