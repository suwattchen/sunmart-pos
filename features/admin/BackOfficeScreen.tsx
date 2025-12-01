import React, { useState } from 'react';
import { LayoutGrid, BrainCircuit, Package, LogOut, TrendingUp, Sparkles, Zap, Store, Settings, Users, Monitor, ChevronLeft, Search, Bell, X, BarChart, History, Box, DollarSign, Plus, Globe, Check, Shield } from 'lucide-react';
import { useSystem } from '../../contexts/SystemContext';
import { BackOfficeTab, AIPromotionSuggestion, SPOSProduct, AppModule, UserRole, User } from '../../types';
import { Button } from '../../components/Button';
import { SmartButton } from '../../components/SmartButton';
import { analyzeBusinessAndSuggestPromotions } from '../../services/geminiService';
import { POSScreen } from '../pos/POSScreen';

type BackOfficeView = 'HOME' | 'POS' | 'INVENTORY' | 'ANALYTICS' | 'SETTINGS' | 'EMPLOYEES' | 'WEBSITE';

export const BackOfficeScreen: React.FC = () => {
  const { currentUser, logout, orders, products, pos, checkPermission, systemUsers, addSystemUser, removeSystemUser } = useSystem();
  
  // Navigation State
  const [currentApp, setCurrentApp] = useState<BackOfficeView>('HOME');
  const [activeTab, setActiveTab] = useState<BackOfficeTab>('DASHBOARD');
  
  // AI State
  const [aiSuggestions, setAiSuggestions] = useState<AIPromotionSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // POS Launcher State 
  const [isPOSOpen, setIsPOSOpen] = useState(false);

  // Form View State
  const [selectedProduct, setSelectedProduct] = useState<SPOSProduct | null>(null);

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);

  // --- SUB COMPONENT: PRODUCT FORM VIEW (Overlay) ---
  const ProductFormView = ({ product, onClose }: { product: SPOSProduct, onClose: () => void }) => {
     const [activeFormTab, setActiveFormTab] = useState('general');
     const canEdit = checkPermission('INVENTORY', 'write');

     return (
        <div className="absolute inset-0 bg-gray-100 z-50 flex flex-col animate-in slide-in-from-right duration-200">
           {/* Control Panel (Breadcrumb & Actions) */}
           <div className="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4 text-sm">
                  <button onClick={onClose} className="text-brand-600 font-bold hover:underline">Products</button>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-600">{product.display_name}</span>
              </div>
              <div className="flex gap-2">
                 <Button size="sm" variant="outline" onClick={onClose}>Discard</Button>
                 {canEdit && <Button size="sm">Save</Button>}
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto bg-white shadow rounded-lg border border-gray-200 min-h-[600px]">
                 
                 {/* Smart Buttons Header */}
                 <div className="px-6 py-4 border-b flex justify-end gap-2 bg-gray-50/50">
                    <SmartButton 
                       icon={DollarSign} 
                       label="Sold" 
                       value={orders.filter(o => o.items.some((i: any) => i.product.id === product.id)).length.toString()} 
                       subLabel="Units"
                    />
                    <SmartButton 
                       icon={Box} 
                       label="On Hand" 
                       value={product.qty_available.toString()} 
                       subLabel="Units"
                    />
                 </div>

                 {/* Header Info */}
                 <div className="p-8 flex gap-8">
                     <div className="w-32 h-32 bg-gray-100 rounded border relative group">
                        <img src={product.image_url} className="w-full h-full object-cover"/>
                        {canEdit && <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs cursor-pointer transition-opacity">Edit</div>}
                     </div>
                     <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-500 mb-1">Product Name</label>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.display_name}</h1>
                        
                        <div className="flex gap-4">
                           <div className="flex items-center gap-2">
                              <input type="checkbox" checked disabled={!canEdit} className="w-4 h-4 text-brand-600 rounded"/>
                              <span className="text-sm text-gray-700">Can be Sold</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <input type="checkbox" checked disabled={!canEdit} className="w-4 h-4 text-brand-600 rounded"/>
                              <span className="text-sm text-gray-700">Can be Purchased</span>
                           </div>
                        </div>
                     </div>
                 </div>

                 {/* Notebook Tabs */}
                 <div>
                    <div className="px-8 border-b flex gap-8">
                       {['General Information', 'Sales', 'Purchase', 'Inventory'].map(tab => {
                          const key = tab.split(' ')[0].toLowerCase();
                          return (
                             <button 
                                key={key}
                                onClick={() => setActiveFormTab(key)}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeFormTab === key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                             >
                                {tab}
                             </button>
                          );
                       })}
                    </div>
                    
                    <div className="p-8">
                       {activeFormTab === 'general' && (
                          <div className="grid grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
                              <div className="space-y-4">
                                 <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-bold text-gray-600">Product Type</label>
                                    <div className="col-span-2 text-sm text-gray-900 border-b border-dotted pb-1">Storable Product</div>
                                 </div>
                                 <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-bold text-gray-600">Sales Price</label>
                                    <div className="col-span-2 text-sm text-gray-900 font-bold border-b border-dotted pb-1">${product.lst_price.toFixed(2)}</div>
                                 </div>
                                 <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-bold text-gray-600">Cost</label>
                                    <div className="col-span-2 text-sm text-gray-900 border-b border-dotted pb-1">${product.standard_price.toFixed(2)}</div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-bold text-gray-600">Internal Ref</label>
                                    <div className="col-span-2 text-sm text-gray-900 border-b border-dotted pb-1">{product.default_code || '-'}</div>
                                 </div>
                                 <div className="grid grid-cols-3 items-center">
                                    <label className="text-sm font-bold text-gray-600">Category</label>
                                    <div className="col-span-2 text-sm text-gray-900 border-b border-dotted pb-1">{product.categ_id[1]}</div>
                                 </div>
                              </div>
                          </div>
                       )}
                       {activeFormTab === 'sales' && (
                          <div className="text-gray-500 italic">Sales configuration options...</div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
     );
  };

  const UserModal = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('CASHIER');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addSystemUser({ id: `u${Date.now()}`, name, email, role, tenantId: 't1', avatar: '' });
        setShowUserModal(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Create Employee</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Name</label>
                      <input required className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Email</label>
                      <input required type="email" className="w-full border rounded p-2" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                      <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Role</label>
                      <select className="w-full border rounded p-2" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                          <option value="CASHIER">Cashier</option>
                          <option value="SALES_MANAGER">Sales Manager</option>
                          <option value="INVENTORY_MANAGER">Inventory Manager</option>
                          <option value="TENANT_ADMIN">Administrator</option>
                      </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                      <Button variant="ghost" onClick={() => setShowUserModal(false)}>Cancel</Button>
                      <Button type="submit">Create User</Button>
                  </div>
              </form>
           </div>
        </div>
    );
  };

  if (isPOSOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <POSScreen />
      </div>
    );
  }

  // --- HOME MENU (APP LAUNCHER) ---
  if (currentApp === 'HOME') {
    const apps = [
        { id: 'POS', label: 'Point of Sale', icon: Monitor, color: 'bg-purple-600', module: 'POS' },
        { id: 'INVENTORY', label: 'Inventory', icon: Package, color: 'bg-orange-500', module: 'INVENTORY' },
        { id: 'ANALYTICS', label: 'Dashboards', icon: BarChart, color: 'bg-blue-600', module: 'ANALYTICS' },
        { id: 'SETTINGS', label: 'Settings', icon: Settings, color: 'bg-slate-500', module: 'SETTINGS' },
        { id: 'EMPLOYEES', label: 'Employees', icon: Users, color: 'bg-teal-600', module: 'EMPLOYEES' },
        { id: 'WEBSITE', label: 'Website', icon: Globe, color: 'bg-pink-600', module: 'WEBSITE' },
        { id: 'AI', label: 'AI Advisor', icon: BrainCircuit, color: 'bg-emerald-600', module: 'AI' },
    ];

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 font-sans text-white flex flex-col">
        {/* Top Bar */}
        <div className="h-12 bg-white/5 backdrop-blur px-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <LayoutGrid className="w-4 h-4 text-white/50"/>
             <span className="font-bold tracking-tight text-sm opacity-80">Sunmart Enterprise</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/10 rounded transition cursor-pointer">
                <img src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.name}`} className="w-5 h-5 rounded-full"/>
                <div className="flex flex-col">
                    <span className="text-xs font-medium leading-tight">{currentUser?.name}</span>
                    <span className="text-[10px] text-white/50 leading-tight">{currentUser?.role.replace('_', ' ')}</span>
                </div>
             </div>
             <button onClick={logout} className="p-1 hover:bg-white/10 rounded transition"><LogOut className="w-4 h-4 text-white/50"/></button>
          </div>
        </div>

        {/* App Grid */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 max-w-4xl">
              {apps.map((app) => {
                  // Permission Check
                  const hasAccess = checkPermission(app.module as AppModule, 'read');
                  if (!hasAccess) return null;

                  return (
                    <button 
                    key={app.id}
                    onClick={() => setCurrentApp(app.id as BackOfficeView)}
                    className="flex flex-col items-center gap-2 group p-2 rounded-xl hover:bg-white/5 transition-colors"
                    >
                        <div className={`w-16 h-16 ${app.color} rounded-2xl shadow-lg shadow-black/20 flex items-center justify-center transform transition-transform group-hover:scale-105 duration-200 border border-white/10`}>
                            <app.icon className="w-8 h-8 text-white drop-shadow-sm"/>
                        </div>
                        <span className="text-xs font-medium text-white/80 group-hover:text-white shadow-black drop-shadow-md">{app.label}</span>
                    </button>
                  );
              })}
           </div>
        </div>
      </div>
    );
  }

  // --- APP INTERFACE ---
  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 font-sans relative overflow-hidden">
      
      {/* Product Form Overlay */}
      {selectedProduct && <ProductFormView product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      
      {/* User Create Modal */}
      {showUserModal && <UserModal />}

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r flex flex-col shrink-0 z-10">
        <div className="h-14 flex items-center px-4 border-b gap-3">
          <button onClick={() => setCurrentApp('HOME')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-brand-600 transition-colors" title="Apps">
             <LayoutGrid className="w-5 h-5"/>
          </button>
          <div className="font-bold text-gray-800 tracking-tight text-sm uppercase">
             {currentApp}
          </div>
        </div>

        <div className="p-2 flex-1 overflow-y-auto space-y-1">
           {currentApp === 'POS' && (
             <>
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase mt-2">Operations</div>
                <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium ${activeTab === 'DASHBOARD' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Monitor className="w-4 h-4"/> Dashboard
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-50">
                  <TrendingUp className="w-4 h-4"/> Orders
                </button>
                {/* Guard Settings in Sidebar */}
                {checkPermission('SETTINGS', 'read') && (
                    <>
                        <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase mt-4">Configuration</div>
                        <button onClick={() => setCurrentApp('SETTINGS')} className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Settings className="w-4 h-4"/> Settings
                        </button>
                    </>
                )}
             </>
           )}

           {currentApp === 'INVENTORY' && (
             <>
               <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase mt-2">Stock</div>
                <button onClick={() => setActiveTab('PRODUCTS')} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium ${activeTab === 'PRODUCTS' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                   <Package className="w-4 h-4"/> Products
                </button>
             </>
           )}
           
           {currentApp === 'EMPLOYEES' && (
             <>
               <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium bg-brand-50 text-brand-700">
                   <Users className="w-4 h-4"/> All Employees
               </button>
             </>
           )}

           {currentApp === 'SETTINGS' && (
             <>
               <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium bg-brand-50 text-brand-700">
                   <Settings className="w-4 h-4"/> General Settings
               </button>
             </>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50">
         {/* Top Header */}
         <header className="h-14 bg-white border-b px-6 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2 text-sm text-gray-500">
               <span className="hover:text-gray-700 cursor-pointer">Sunmart</span> 
               <ChevronLeft className="w-4 h-4 rotate-180 text-gray-300"/> 
               <span className="text-gray-900 font-medium">{activeTab === 'DASHBOARD' ? 'Overview' : currentApp}</span>
             </div>
             <div className="flex items-center gap-4">
               <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                 <input className="pl-9 pr-4 py-1.5 bg-gray-100 rounded border border-transparent focus:bg-white focus:border-brand-300 text-sm outline-none transition-all" placeholder="Search..."/>
               </div>
             </div>
         </header>

         <div className="flex-1 overflow-y-auto p-6">
            
            {/* --- POS DASHBOARD VIEW --- */}
            {currentApp === 'POS' && activeTab === 'DASHBOARD' && (
               <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow transition">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                           <div>
                              <h3 className="font-bold text-gray-900">Main Shop</h3>
                              <p className="text-xs text-gray-500">POS/001</p>
                           </div>
                           <div className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase border border-green-200">Online</div>
                        </div>
                        <div className="p-6 flex flex-col items-center gap-4">
                           {/* Only allow Starting session if they have write access */}
                           <Button onClick={() => setIsPOSOpen(true)} className="shadow-brand-500/20 shadow-lg" disabled={!checkPermission('POS', 'write')}>
                              NEW SESSION
                           </Button>
                           <span className="text-xs text-gray-400">Last closed: Today 10:00 AM</span>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* --- PRODUCTS VIEW (KANBAN/LIST) --- */}
            {(currentApp === 'INVENTORY' || (currentApp === 'POS' && activeTab === 'PRODUCTS')) && (
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-700">Products</h2>
                    {checkPermission('INVENTORY', 'write') && (
                        <Button size="sm" onClick={() => alert("Create Product Logic")}>
                            <Plus className="w-4 h-4 mr-2"/> Create
                        </Button>
                    )}
                 </div>
                 <div className="bg-white rounded shadow-sm border overflow-hidden">
                 <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                    <tr>
                      <th className="px-6 py-3 w-10"><input type="checkbox"/></th>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Internal Ref</th>
                      <th className="px-6 py-3 text-right">Sales Price</th>
                      <th className="px-6 py-3 text-right">Cost</th>
                      <th className="px-6 py-3 text-right">On Hand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pos.db.get_products_by_category(0).map(p => (
                      <tr 
                        key={p.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedProduct(p)}
                      >
                        <td className="px-6 py-3"><input type="checkbox" onClick={e => e.stopPropagation()}/></td>
                        <td className="px-6 py-3 font-medium text-brand-700">{p.display_name}</td>
                        <td className="px-6 py-3 text-gray-500">{p.default_code || '-'}</td>
                        <td className="px-6 py-3 text-right">${p.lst_price.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right text-gray-500">${p.standard_price.toFixed(2)}</td>
                        <td className={`px-6 py-3 text-right font-bold ${p.qty_available < 10 ? 'text-red-600' : 'text-gray-800'}`}>{p.qty_available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </div>
            )}

            {/* --- EMPLOYEES VIEW --- */}
            {currentApp === 'EMPLOYEES' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-700">Employees</h2>
                            <p className="text-xs text-gray-500">Manage user access and roles</p>
                        </div>
                        {checkPermission('EMPLOYEES', 'write') && (
                            <Button size="sm" onClick={() => setShowUserModal(true)}>
                                <Plus className="w-4 h-4 mr-2"/> New Employee
                            </Button>
                        )}
                    </div>

                    <div className="bg-white rounded border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {systemUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            {u.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {checkPermission('EMPLOYEES', 'delete') && (
                                                <button onClick={() => removeSystemUser(u.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- SETTINGS VIEW --- */}
            {currentApp === 'SETTINGS' && (
                <div className="max-w-2xl bg-white rounded-lg border shadow-sm p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-500"/> General Settings
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
                            <input 
                                type="text" 
                                className="w-full border rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none" 
                                defaultValue="Sunmart Enterprise"
                                disabled={!checkPermission('SETTINGS', 'write')}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Currency</label>
                                <select 
                                    className="w-full border rounded-lg p-2.5 bg-gray-50" 
                                    disabled={!checkPermission('SETTINGS', 'write')}
                                >
                                    <option>USD ($)</option>
                                    <option>THB (฿)</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Default Tax (%)</label>
                                <input 
                                    type="number" 
                                    className="w-full border rounded-lg p-2.5 bg-gray-50" 
                                    defaultValue={7}
                                    disabled={!checkPermission('SETTINGS', 'write')}
                                />
                             </div>
                        </div>

                        {!checkPermission('SETTINGS', 'write') && (
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-700 flex items-center gap-2">
                                <Shield className="w-4 h-4"/> You do not have permission to edit settings.
                            </div>
                        )}
                        
                        {checkPermission('SETTINGS', 'write') && (
                            <div className="pt-4 border-t flex justify-end">
                                <Button>Save Changes</Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- WEBSITE VIEW --- */}
            {currentApp === 'WEBSITE' && (
                <div className="flex flex-col h-full">
                     <div className="bg-white border rounded-lg p-6 mb-6 flex justify-between items-center">
                         <div>
                             <h2 className="text-lg font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-pink-500"/> Sunmart eCommerce</h2>
                             <p className="text-sm text-gray-500">Manage your online storefront</p>
                         </div>
                         <div className="flex gap-4 items-center">
                             <div className="flex items-center gap-2">
                                 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                 <span className="text-sm font-bold text-green-700">Published</span>
                             </div>
                             {checkPermission('WEBSITE', 'write') && (
                                <Button size="sm" variant="outline">Unpublish</Button>
                             )}
                             <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
                                 Go to Website
                             </Button>
                         </div>
                     </div>

                     <div className="flex-1 bg-gray-100 border-4 border-dashed border-gray-200 rounded-lg flex items-center justify-center flex-col text-gray-400">
                          <Globe className="w-16 h-16 mb-4 opacity-50"/>
                          <h3 className="font-bold text-lg">Website Builder Preview</h3>
                          {checkPermission('WEBSITE', 'write') ? (
                              <Button variant="ghost" className="mt-2 text-brand-600">Click to Edit Homepage</Button>
                          ) : (
                              <p className="text-xs mt-2">Read-only View</p>
                          )}
                     </div>
                </div>
            )}

            {/* --- ANALYTICS VIEW --- */}
            {currentApp === 'ANALYTICS' && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
                    <BrainCircuit className="w-12 h-12 text-brand-500 mx-auto mb-4"/>
                    <h2 className="text-xl font-bold text-gray-900">AI Promotion Engine</h2>
                    <p className="text-gray-500 mb-6">Analyze sales data to generate marketing campaigns.</p>
                    <Button 
                          onClick={async () => {
                            setIsAnalyzing(true);
                            const res = await analyzeBusinessAndSuggestPromotions(orders, pos.db.get_products_by_category(0));
                            setAiSuggestions(res);
                            setIsAnalyzing(false);
                          }} 
                          disabled={isAnalyzing} 
                        >
                          {isAnalyzing ? 'Thinking...' : 'Run Analysis'} 
                      </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {aiSuggestions.map((sug, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-800 mb-2">{sug.title}</h3>
                          <div className="text-sm text-gray-600 mb-4">{sug.rationale}</div>
                          <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm font-medium">
                            {sug.suggestedAction}
                          </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
         </div>
      </main>
    </div>
  );
};