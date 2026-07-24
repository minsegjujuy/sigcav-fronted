import { createContext, useContext, useState, type ReactNode } from "react";
import type { ActaSalienteDto } from "../models/ActaSalienteDto";

interface ActaSalienteContextType {
  actaSeleccionada: ActaSalienteDto | null;
  setActaSeleccionada: (acta: ActaSalienteDto | null) => void;
}

const ActaSalienteContext = createContext<ActaSalienteContextType | undefined>(
  undefined
);

export const ActaSalienteProvider = ({ children }: { children: ReactNode }) => {
  const [actaSeleccionada, setActaSeleccionada] =
    useState<ActaSalienteDto | null>(null);



  return (
    <ActaSalienteContext.Provider
      value={{
        actaSeleccionada,
        setActaSeleccionada,
      }}
    >
      {children}
    </ActaSalienteContext.Provider>
  );
};

export const useActaSaliente = () => {
  const context = useContext(ActaSalienteContext);
  if (!context) {
    throw new Error("useActaSaliente debe usarse dentro de ActaSalienteProvider");
  }
  return context;
};
