import { createContext, useContext, useState, type ReactNode } from 'react';
import type { HechoVialForm } from '../models/HechoVialForm';

type ModoFormulario = 'create' | 'edit';

interface HechoVialContextType {
  hechoVial: HechoVialForm | null;
  modo: ModoFormulario;
  setHechoVial: (hv: HechoVialForm) => void;
  limpiarHechoVial: () => void;
}

const HechoVialContext = createContext<HechoVialContextType | undefined>(
  undefined
);

export const HechoVialProvider = ({ children }: { children: ReactNode }) => {
  const [hechoVial, setHechoVialState] = useState<HechoVialForm | null>(null);
  const [modo, setModo] = useState<ModoFormulario>('create');

  const setHechoVial = (hv: HechoVialForm) => {
    setHechoVialState(hv);
    setModo('edit');
  };

  const limpiarHechoVial = () => {
    setHechoVialState(null);
    setModo('create');
  };

  return (
    <HechoVialContext.Provider
      value={{
        hechoVial,
        modo,
        setHechoVial,
        limpiarHechoVial
      }}
    >
      {children}
    </HechoVialContext.Provider>
  );
};

export const useHechoVial = () => {
  const context = useContext(HechoVialContext);
  if (!context) {
    throw new Error('useHechoVial debe usarse dentro de HechoVialProvider');
  }
  return context;
};
