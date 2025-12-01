
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { ReceiptData } from '../types';

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-6 bg-slate-900 text-white text-center">
        <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/50">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold">Payment Successful</h2>
        <p className="text-slate-400 text-sm">Transaction Completed</p>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto font-mono text-sm">
        <div className="text-center mb-6 border-b pb-4 border-dashed">
          <h3 className="font-bold text-lg uppercase tracking-wider">{data.storeName}</h3>
          <p className="text-gray-500 text-xs mt-1">TAX ID: 123-456-789-000</p>
          <p className="text-gray-500 text-xs">{data.timestamp}</p>
          <p className="text-gray-500 text-xs">Cashier: {data.cashier}</p>
          <p className="text-gray-900 text-xs mt-2 font-bold border px-2 py-1 inline-block rounded">INV: {data.orderNumber}</p>
        </div>

        <div className="space-y-2 mb-6">
          {data.order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-gray-800">
              <span className="truncate pr-4">{item.quantity}x {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed pt-4 space-y-1">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>${data.order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax (7%)</span>
            <span>${data.order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2 text-gray-900">
            <span>TOTAL</span>
            <span>${data.order.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
           <div className="w-32 h-32 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-400 flex-col gap-2">
             <div className="w-24 h-24 bg-black/10 mix-blend-multiply"></div>
             <span>[ QR CODE ]</span>
           </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t">
        <Button fullWidth onClick={onClose} variant="primary">Print Receipt & Close</Button>
      </div>
    </div>
  </div>
);
