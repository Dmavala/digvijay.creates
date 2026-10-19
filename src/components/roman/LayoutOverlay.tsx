import React from 'react';

export const LayoutOverlay: React.FC = () => {
  return (
    <div className="layout__overlay" aria-hidden="true">
      {Array.from({ length: 15 }).map((_, index) => (
        <div key={index} className="column" />
      ))}
    </div>
  );
};
