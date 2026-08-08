import React from 'react';

const PasswordStrengthIndicator = ({ strength }) => {
  const strengthLevels = [
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f97316' },
    { label: 'Good', color: '#eab308' },
    { label: 'Strong', color: '#22c55e' },
  ];

  const barWidth = `${(strength + 1) * 25}%`;

  return (
    <div style={{ width: '100%', marginTop: '8px' }}>
      <div style={{ 
        height: '8px', 
        width: '100%', 
        backgroundColor: '#e5e7eb', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: barWidth,
          backgroundColor: strengthLevels[strength]?.color || '#e5e7eb',
          transition: 'width 0.3s ease, background-color 0.3s ease'
        }}></div>
      </div>
      <p style={{ 
        textAlign: 'right', 
        fontSize: '12px', 
        marginTop: '4px',
        color: strengthLevels[strength]?.color || '#6b7280',
        fontWeight: '500'
      }}>
        {strengthLevels[strength]?.label || ''}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;   