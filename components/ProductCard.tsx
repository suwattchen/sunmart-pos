
import React from 'react';
import { Sparkles } from 'lucide-react';
import { SPOSProduct } from '../types';

interface ProductCardProps {
  product: SPOSProduct;
  onClick: (p: SPOSProduct) => void;
  onAI: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onClick, onAI }) => (
  <div 
    onClick={() => onClick(product)}
    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-brand-500 transition-all duration-200 active:scale-95 flex flex-col h-56 group relative ${product.qty_available <= 0 ? 'opacity-60 pointer-events-none grayscale' : ''}`}
  >
    <div className="h-32 bg-gray-100 overflow-hidden relative">
      <img src={product.image_url} alt={product.display_name} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm font-bold font-mono">
        ${product.lst_price.toFixed(2)}
      </div>
      {product.qty_available <= 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
           <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">OUT OF STOCK</span>
        </div>
      )}
    </div>
    <div className="p-3 flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{product.display_name}</h3>
      </div>
      <div className="flex justify-between items-center mt-2">
         <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${product.qty_available < 10 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
           Stock: {product.qty_available}
         </span>
      </div>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onAI(product.id); }}
      className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-600 z-10"
      title="AI Optimize"
    >
      <Sparkles className="w-3 h-3" />
    </button>
  </div>
));
