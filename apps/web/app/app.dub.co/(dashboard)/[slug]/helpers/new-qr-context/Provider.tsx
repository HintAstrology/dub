"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface NewQrContextType {
  newQrId?: string | null;
  setNewQrId?: Dispatch<SetStateAction<string | null>>;
  registerCloseEditModal?: (qrId: string, callback: () => void) => void;
  unregisterCloseEditModal?: (qrId: string) => void;
  triggerCloseEditModal?: () => void;
}

// Create the context
const Context = createContext<NewQrContextType>({});

// Provider props interface
interface ProviderProps {
  children: ReactNode;
  newQrId?: string | null;
}

// Provider component
export function NewQrProvider({ children, newQrId }: ProviderProps) {
  const [newQrIdState, setNewQrIdState] = useState<string | null>(newQrId || null);
  
  const closeEditModalCallbacks = useRef<Map<string, () => void>>(new Map());

  const registerCloseEditModal = useCallback((qrId: string, callback: () => void) => {
    closeEditModalCallbacks.current.set(qrId, callback);
  }, []);

  const unregisterCloseEditModal = useCallback((qrId: string) => {
    closeEditModalCallbacks.current.delete(qrId);
  }, []);

  const triggerCloseEditModal = useCallback(() => {
    const allCallbacks = Array.from(closeEditModalCallbacks.current.values());
    allCallbacks.forEach(cb => cb());
  }, []);

  return (
    <Context.Provider value={{ 
      newQrId: newQrIdState, 
      setNewQrId: setNewQrIdState,
      registerCloseEditModal,
      unregisterCloseEditModal,
      triggerCloseEditModal,
    }}>
      {children}
    </Context.Provider>
  );
}

// Custom hook to use the context
export function useNewQrContext() {
  return useContext(Context) || {};
}

// Export the context for advanced usage if needed
export { Context };
