import { createContext, useContext, ReactNode } from "react";

interface ToastContextType {
  showToast?: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  // Dummy toast function
  const showToast = (msg: string) => {
    alert(msg);
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
