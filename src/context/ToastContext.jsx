import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timeoutRef = React.useRef(null);

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => setToast(null), duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="toast-container">
          <div className="glass-panel toast-message">
            {toast}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
