import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = "info", duration }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) return null;

  // Determine the background color class dynamically
  let bgColorClass;
  let textColorClass;
  switch (type) {
    case 'info':
      bgColorClass = 'bg-info';
      textColorClass = 'text-info-content'
      break;
    case 'success':
      bgColorClass='bg-success';
      textColorClass = 'text-success-content'
      break;
    case 'warning':
        bgColorClass='bg-warning';
        textColorClass = 'text-warning-content'
        break;
    case 'error':
      bgColorClass = 'bg-error';
      textColorClass = 'text-error-content'
      break;
    default:
      bgColorClass = 'bg-info'; // Default to 'info' color
      bgColorClass = 'text-info-content'; // Default to 'info' color
      break;
  }

  return (
    <div className={`fixed bottom-4 right-4 p-4 ${bgColorClass} ${textColorClass} rounded shadow-lg flex items-center space-x-4`}>
      <div>
        <div>{message}</div>
        <div className="w-full h-1 bg-primary mt-2 relative">
          <div className={`bg-accent h-1 absolute top-0 left-0`} style={{ animation: `progress ${duration}ms linear` }} />
        </div>
      </div>
      
      <style>
        {`
          @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;
