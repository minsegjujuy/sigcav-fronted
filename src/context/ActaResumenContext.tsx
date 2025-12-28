import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ActaResumenDto } from '../models/ActaResumenDto';

interface ActaContextType {
  actaSeleccionada: ActaResumenDto | null;
  seleccionarActa: (acta: ActaResumenDto) => void;
  limpiarActa: () => void;
}
const ActaContext = createContext<ActaContextType | undefined>(undefined);

export const ActaProvider = ({ children }: { children: ReactNode }) => {
  const [actaSeleccionada, setActaSeleccionada] = useState<ActaResumenDto | null>(null);

  const seleccionarActa = (acta: ActaResumenDto) => {
    setActaSeleccionada(acta);
  };

  const limpiarActa = () => {
    setActaSeleccionada(null);
  };

  return (
    <ActaContext.Provider
      value={{
        actaSeleccionada,
        seleccionarActa,
        limpiarActa
      }}
    >
      {children}
    </ActaContext.Provider>
  );
};

export const useActa = (): ActaContextType => {
  const context = useContext(ActaContext);
  if (!context) {
    throw new Error('useActa debe usarse dentro de ActaProvider');
  }
  return context;
};




