import { createContext, useContext, ReactNode, useMemo } from "react";

interface AppContextType {
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo<AppContextType>(() => ({
    t: (key: string) => key
  }), []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// Alias for compatibility
export const useApp = useAppContext;
