import React, { useState } from 'react';

const Tooltip = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {showTooltip && (
        <div className="bg-shark-700" style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '5px',         
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '12px',
          zIndex: '1',
          width: "500px"
        }}>
          {text}
        </div>
      )}
    </div>
  )
}

export default Tooltip