import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Articulo } from "../models/Articulo";
import { getArticulos } from "../services/ArticuloService";

interface ArticuloContextType{
  articulos: Articulo[]
}

const ArticuloContext = createContext<ArticuloContextType | undefined>(undefined);

export const ArticuloProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [articulos, setArticulos] = useState<Articulo[]>([]);

  const fetchArticulos = async () => {
      const data = await getArticulos();
      setArticulos(data);
      console.log('articulo por ley ', data)
  }

  useEffect(()=>{
    fetchArticulos()
  }, [])

  return (
    <ArticuloContext.Provider value={{ articulos }}>
      {children}
    </ArticuloContext.Provider>
  );
};

export const useArticulo = (): ArticuloContextType => {
  const context = useContext(ArticuloContext);
  if (!context) {
    throw new Error("useArticulo debe usarse dentro de un AuthProvider");
  }
  return context;
};