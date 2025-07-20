// components/Toast.jsx
import React, { useEffect } from 'react';
import '../styles/Toast.css'; // Or wherever your toast styles live

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

export default Toast;