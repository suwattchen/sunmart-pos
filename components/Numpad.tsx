
import React from 'react';
import { Delete } from 'lucide-react';

interface NumpadProps {
  onInput: (value: string) => void;
  onDelete: () => void;
  mode?: 'qty' | 'price' | 'disc';
  setMode?: (mode: 'qty' | 'price' | 'disc') => void;
  disabled?: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({ onInput, onDelete, mode = 'qty', setMode, disabled }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+/-', '0', '.'];
  
  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Mode Selectors (Odoo Style) */}
      {setMode && (
        <div className="flex border-b divide-x">
          <button 
            onClick={() => setMode('qty')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'qty' ? 'bg-brand-500 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            Qty
          </button>
          <button 
            onClick={() => setMode('disc')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'disc' ? 'bg-brand-500 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            % Disc
          </button>
          <button 
            onClick={() => setMode('price')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'price' ? 'bg-brand-500 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
          >
            Price
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 grid grid-cols-3 gap-[1px] bg-gray-200 p-[1px]">
        {keys.map((key) => (
          <button
            key={key}
            disabled={disabled}
            onClick={() => onInput(key)}
            className="bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-700 transition-colors disabled:opacity-50"
          >
            {key}
          </button>
        ))}
        {/* Backspace spans full width at bottom or replaces a key? Odoo usually puts it next to 0 or separate. Let's make it a dedicated button outside or integrated. */}
      </div>
      <button 
        onClick={onDelete}
        className="h-16 flex items-center justify-center bg-gray-100 hover:bg-red-50 hover:text-red-600 border-t transition-colors"
      >
        <Delete className="w-6 h-6" />
      </button>
    </div>
  );
};
