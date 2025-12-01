
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Trash2, UserCircle, CreditCard, Sparkles, ChevronLeft, Banknote, Home, Info, RotateCcw, Tag, Disc } from 'lucide-react';
import { useSystem } from '../../contexts/SystemContext';
import { Button } from '../../components/Button';
import { ProductCard } from '../../components/ProductCard'; 
import { Numpad } from '../../components/Numpad';
import { ReceiptModal } from '../../components/ReceiptModal';
import { SPOSOrderline } from '../../services/odooModels';

export const POSScreen: React.FC = () => {
  const { pos, currentOrder, refreshUI, currentUser, logout } = useSystem();
  
  // UI State
  const [viewMode, setViewMode] = useState<'PRODUCT' | 'PAYMENT'>('PRODUCT');
  const [searchQuery, setSearchQuery] = useState('');
  const [numpadMode, setNumpadMode] = useState<'qty' | 'price' | 'disc'>('qty');
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0);
  
  // Force re-render when engine changes
  useEffect(() => {}, [refreshUI]);

  // Actions delegated to SPOS Engine
  const handleProductClick = (product: any) => {
    if (currentOrder) {
        currentOrder.add_product(product);
    }
  };

  const handleNumpadInput = (val: string) => {
    if (viewMode === 'PAYMENT') {
        return;
    }

    const selectedLine = currentOrder?.get_selected_orderline();
    if (!selectedLine) return;

    if (val === '.') return; 
    
    const num = parseInt(val);
    if (numpadMode === 'qty') selectedLine.set_quantity(num);
    if (numpadMode === 'price') selectedLine.set_price(num);
    if (numpadMode === 'disc') selectedLine.set_discount(num);
  };

  const handleNumpadDelete = () => {
     const selectedLine = currentOrder?.get_selected_orderline();
     if (selectedLine) {
         currentOrder?.remove_orderline(selectedLine);
     }
  };

  const handlePayment = () => {
      if (!currentOrder) return;
      const data = {
          storeName: "Sunmart Shop",
          cashier: currentUser?.name || "Cashier",
          timestamp: new Date().toLocaleString(),
          orderNumber: currentOrder.name,
          order: {
              items: currentOrder.orderlines.map(l => ({
                  name: l.product.display_name,
                  quantity: l.quantity,
                  price: l.price
              })),
              subtotal: currentOrder.get_total_without_tax(),
              tax: currentOrder.get_total_tax(),
              total: currentOrder.get_total_with_tax()
          }
      };
      setReceiptData(data);
      pos.push_orders(currentOrder);
      pos.add_new_order(); 
      setViewMode('PRODUCT');
  };

  // Determine Products to Show
  let products = [];
  if (searchQuery) {
     products = pos.db.search_product(searchQuery);
  } else {
     products = pos.db.get_products_by_category(currentCategoryId);
  }
  const subCategories = pos.db.get_subcategories(currentCategoryId);

  const orderlines = currentOrder ? currentOrder.orderlines : [];
  const totalDue = currentOrder ? currentOrder.get_total_with_tax() : 0;

  return (
    <div className="flex h-screen w-screen bg-gray-100 font-sans overflow-hidden">
        {receiptData && <ReceiptModal data={receiptData} onClose={() => setReceiptData(null)} />}

        {/* LEFT: Order Summary (Cart) */}
        <div className="w-[450px] bg-white border-r flex flex-col z-10 shadow-xl relative">
            {/* Header */}
            <div className="h-14 border-b flex items-center justify-between px-4 bg-white shadow-sm z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-brand-600"/>
                    </div>
                    <div>
                        <div className="font-bold text-sm text-gray-800">{currentOrder?.client?.name || 'Walk-in Customer'}</div>
                    </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => pos.delete_current_order()}><Trash2 className="w-4 h-4 text-red-400"/></Button>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto bg-white">
                {orderlines.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <ShoppingCart className="w-12 h-12 mb-2"/>
                        <span className="text-sm">Cart is empty</span>
                    </div>
                )}
                {orderlines.map(line => (
                    <div 
                        key={line.internalId}
                        onClick={() => currentOrder?.select_orderline(line)}
                        className={`p-3 border-b flex justify-between cursor-pointer transition-colors ${line.selected ? 'bg-brand-50 border-l-4 border-l-brand-500' : 'hover:bg-gray-50'}`}
                    >
                        <div className="flex-1">
                            <div className="font-medium text-gray-800 text-sm">{line.product.display_name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {line.quantity} Units x ${line.price.toFixed(2)}
                                {line.discount > 0 && <span className="text-green-600 ml-2 font-bold">(-{line.discount}%)</span>}
                            </div>
                        </div>
                        <div className="font-bold text-gray-900 text-sm">${line.get_price_with_tax().toFixed(2)}</div>
                    </div>
                ))}
            </div>

            {/* Numpad & Totals */}
            <div className="h-[420px] border-t bg-slate-50 flex flex-col shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20">
                <div className="p-4 flex justify-between items-end border-b bg-white">
                    <div className="text-xs text-gray-500">Tax Included: ${currentOrder?.get_total_tax().toFixed(2)}</div>
                    <div className="text-4xl font-bold text-gray-900 tracking-tight">${totalDue.toFixed(2)}</div>
                </div>
                
                {viewMode === 'PRODUCT' ? (
                     <div className="flex-1 flex flex-col">
                         <div className="flex-1">
                             <Numpad onInput={handleNumpadInput} onDelete={handleNumpadDelete} mode={numpadMode} setMode={setNumpadMode} />
                         </div>
                         <Button fullWidth size="xl" className="rounded-none h-16 bg-brand-600 hover:bg-brand-700 text-lg font-bold shadow-inner" onClick={() => setViewMode('PAYMENT')}>
                            Payment <ChevronLeft className="w-5 h-5 ml-2 rotate-180"/>
                         </Button>
                     </div>
                ) : (
                    <div className="p-4 space-y-4 h-full flex flex-col">
                        <Button fullWidth variant="outline" onClick={() => setViewMode('PRODUCT')}>
                            <ChevronLeft className="w-4 h-4 mr-2"/> Back to Products
                        </Button>
                        <div className="grid grid-cols-2 gap-3 flex-1">
                            <button className="border-2 border-green-100 hover:border-green-500 bg-green-50 rounded-xl flex flex-col items-center justify-center gap-2 transition-all" onClick={handlePayment}>
                                <Banknote className="w-8 h-8 text-green-600"/> 
                                <span className="font-bold text-green-800">Cash</span>
                            </button>
                            <button className="border-2 border-blue-100 hover:border-blue-500 bg-blue-50 rounded-xl flex flex-col items-center justify-center gap-2 transition-all">
                                <CreditCard className="w-8 h-8 text-blue-600"/> 
                                <span className="font-bold text-blue-800">Card</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: Product Grid */}
        <div className="flex-1 flex flex-col bg-slate-100 relative">
             {/* Top Bar: Search & Breadcrumbs */}
             <div className="h-14 bg-white border-b px-4 flex items-center justify-between shrink-0 shadow-sm z-20">
                 {/* Breadcrumb Navigation */}
                 <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                     <button 
                        onClick={() => setCurrentCategoryId(0)}
                        className={`p-2 rounded hover:bg-gray-100 ${currentCategoryId === 0 ? 'text-brand-600' : 'text-gray-500'}`}
                     >
                        <Home className="w-5 h-5"/>
                     </button>
                     {currentCategoryId !== 0 && (
                        <>
                            <span className="text-gray-300">/</span>
                            <button onClick={() => setCurrentCategoryId(pos.db.get_category_parent(currentCategoryId))} className="text-sm font-medium text-gray-600 hover:text-brand-600">
                                Back
                            </button>
                            <span className="text-gray-300">/</span>
                            <span className="text-sm font-bold text-brand-600 whitespace-nowrap">
                                {pos.db.category_by_id[currentCategoryId]?.name}
                            </span>
                        </>
                     )}
                 </div>

                 <div className="relative w-64 ml-4">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                     <input 
                        className="w-full pl-9 pr-4 py-1.5 rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none border border-transparent focus:border-brand-200 transition-all text-sm" 
                        placeholder="Search Products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                     />
                 </div>
                 <div className="ml-2">
                     <button className="text-gray-400 hover:text-red-500" onClick={logout} title="Close Session">
                         <RotateCcw className="w-5 h-5"/>
                     </button>
                 </div>
             </div>

             {/* Main Content */}
             <div className="flex-1 overflow-y-auto p-4 pb-24">
                 {/* Subcategories (Odoo Style) */}
                 {!searchQuery && subCategories.length > 0 && (
                     <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
                         {subCategories.map(cat => (
                             <button 
                                key={cat.id}
                                onClick={() => setCurrentCategoryId(cat.id)}
                                className="bg-white border hover:border-brand-500 hover:shadow-md transition-all p-4 rounded-lg flex flex-col items-center gap-2 group"
                             >
                                 <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                     <Tag className="w-5 h-5"/>
                                 </div>
                                 <span className="text-xs font-bold text-gray-700 text-center leading-tight">{cat.name}</span>
                             </button>
                         ))}
                     </div>
                 )}

                 {/* Products Grid */}
                 <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {products.map(p => (
                         <div key={p.id}>
                             <ProductCard 
                                product={p} 
                                onClick={handleProductClick} 
                                onAI={() => {}} 
                            />
                         </div>
                     ))}
                 </div>
             </div>

             {/* Bottom Control Bar (Odoo Style) */}
             <div className="absolute bottom-0 left-0 right-0 h-14 bg-white border-t px-2 flex items-center gap-2 overflow-x-auto shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                 <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-sm font-medium text-gray-600">
                     <Info className="w-4 h-4"/> Customer Note
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-sm font-medium text-gray-600">
                     <RotateCcw className="w-4 h-4"/> Refund
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-sm font-medium text-gray-600">
                     <Tag className="w-4 h-4"/> Pricelist
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded text-sm font-medium text-gray-600">
                     <Disc className="w-4 h-4"/> Rewards
                 </button>
                 <div className="flex-1"></div>
                 <div className="px-4 text-xs text-gray-400 font-mono">SPOS v17.0 connected</div>
             </div>
        </div>
    </div>
  );
};
