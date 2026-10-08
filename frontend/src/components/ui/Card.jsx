import React from 'react';

export default function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-gray-300 transition-colors' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between ${className}`}>
      <div>
        {title && <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{title}</h3>}
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
}
