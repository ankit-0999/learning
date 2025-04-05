import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
}

const Card = ({ children, className = '', title, icon, footer, onClick }: CardProps) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden ${onClick ? 'cursor-pointer transition-all hover:shadow-md' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || icon) && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">{footer}</div>}
    </div>
  );
};

export default Card; 