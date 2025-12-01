import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SmartButtonProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subLabel?: string;
  onClick?: () => void;
  className?: string;
}

export const SmartButton: React.FC<SmartButtonProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  subLabel, 
  onClick,
  className = ''
}) => {
  return (
    <button 
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors shadow-sm min-w-[140px] ${className}`}
    >
      <div className="text-brand-600 group-hover:text-brand-700">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col items-start leading-tight">
         <span className="text-lg font-bold text-gray-800">{value}</span>
         <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{label}</span>
         {subLabel && <span className="text-[10px] text-gray-400">{subLabel}</span>}
      </div>
    </button>
  );
};