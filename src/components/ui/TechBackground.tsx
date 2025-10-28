import React from 'react';

export const TechBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradiente animado base */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#FFFFFF] dark:from-[#001E3C] dark:via-[#000814] dark:to-[#000000]"
        style={{
          backgroundSize: '400% 400%',
        }}
      />
      
      {/* Textura de mapa digital */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M0 50h100M50 0v100' stroke='%2300C2FF' stroke-width='0.5' opacity='0.3'/%3E%3Ccircle cx='50' cy='50' r='2' fill='%2300C2FF' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
        }}
      />
      
      {/* Vinheta sutil */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/30 dark:to-black/50" />
    </div>
  );
};
