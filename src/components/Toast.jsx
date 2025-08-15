import React, { useEffect, useState } from 'react';
import '../styles/Toast.css';

const Toast = ({ message, type, onDismiss }) => {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!visible) return null;

  return (
    <div className={`toast ${type}`}>
      {message}
    </div>
  );
};

export default Toast;
