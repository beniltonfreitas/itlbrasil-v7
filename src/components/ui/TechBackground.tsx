import React from 'react';

export const TechBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Fundo institucional limpo - gradiente muito sutil de branco para azul claro */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(210, 40%, 98%) 0%, hsl(213, 30%, 95%) 50%, hsl(210, 40%, 98%) 100%)',
        }}
      />
      
      {/* Padrão geométrico sutil (opcional - muito discreto) */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23003366' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};
