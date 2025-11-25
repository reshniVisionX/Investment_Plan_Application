import React, { useEffect, useState } from "react";
import './Toast.css';

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
    
    // Start exit animation after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation to complete before unmounting
      setTimeout(() => {
        setShouldRender(false);
        onClose();
      }, 500); // Match this with exit animation duration
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!shouldRender) return null;

  return (
    <div className={`toast-container toast-${type} ${isVisible ? 'toast-visible' : 'toast-hidden'}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}
        </span>
        <p className="toast-message">{message}</p>
      </div>
    </div>
  );
};

export default Toast;