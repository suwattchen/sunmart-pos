import React, { useState } from 'react';
import { Database, Plus, Trash2, Globe, Lock, Play, AlertTriangle, Server, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/Button';
import { useSystem } from '../../contexts/SystemContext';

interface DatabaseManagerProps {
  onBack?: () => void;
  isEmbedded?: boolean;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onBack, isEmbedded = false }) => {
  const { databases, createDatabase, deleteDatabase, selectDatabase } = useSystem();
  
  const [mode, setMode] = useState<'LIST' | 'CREATE'>('LIST');
  const [masterPwd, setMasterPwd] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [dbName, setDbName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('US');
  const [isDemo, setIsDemo] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPwd !== 'admin') { // Mock Master Password
        setError("Invalid Master Password. (Hint: use 'admin')");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
        await createDatabase({ name: dbName, email, password, country, isDemo });
        setMode('LIST');
        setDbName(''); setEmail(''); setPassword('');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
     const pwd = prompt("Enter Master Password to DELETE database:");
     if (pwd !== 'admin') {
         alert("Access Denied: Wrong Master Password");
         return;
     }
     if (confirm("DANGER: This will destroy the Docker container and all data. Are you sure?")) {
         await deleteDatabase(id);
     }
  };

  const containerClass = isEmbedded 
    ? "w-full bg-slate-900 text-slate-200" 
    : "min-h-screen bg-slate-100 flex flex-col items-center py-12 px-4 font-sans text-slate-900";
    
  const cardClass = isEmbedded
    ? "bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
    : "w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200";

  const headerTextClass = isEmbedded ? "text-white" : "text-slate-800";
  const subTextClass = isEmbedded ? "text-slate-400" : "text-slate-500";
  const itemBgClass = isEmbedded ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const inputClass = isEmbedded ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900";

  return (
    <div className={containerClass}>
      
      {/* Header - Only show if not embedded */}
      {!isEmbedded && (
        <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-brand-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
                <Database className="w-8 h-8 text-white"/>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Database Manager</h1>
            <p className="text-slate-500 mt-2">Sunmart SPOS Enterprise Orchestrator</p>
        </div>
      )}

      <div className={isEmbedded ? "" : "w-full max-w-4xl"}>
         <div className={cardClass}>
            {/* Top Bar */}
            <div className={`${isEmbedded ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border-b px-6 py-4 flex justify-between items-center`}>
                <div className={`flex items-center gap-2 text-sm ${subTextClass}`}>
                    <Server className="w-4 h-4"/>
                    <span>Host: sunmart-docker-node-01</span>
                </div>
                {mode === 'LIST' && (
                    <Button size="sm" onClick={() => setMode('CREATE')} className="shadow-brand-500/20">
                        <Plus className="w-4 h-4 mr-2"/> Create Database
                    </Button>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="p-8">
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-500 px-4 py-3 rounded flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5"/> {error}
                    </div>
                )}

                {mode === 'CREATE' && (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h2 className={`text-xl font-bold mb-6 text-center ${headerTextClass}`}>New Tenant Provisioning</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${subTextClass}`}>Master Password</label>
                                <input type="password" required className={`w-full border rounded p-2 text-sm ${inputClass}`} placeholder="Server Master Password" value={masterPwd} onChange={e => setMasterPwd(e.target.value)} />
                            </div>
                            <div className={`border-t pt-4 mt-4 ${isEmbedded ? 'border-slate-700' : 'border-slate-200'}`}>
                                <label className={`block text-xs font-bold uppercase mb-1 ${subTextClass}`}>Database Name</label>
                                <input type="text" required pattern="[a-z0-9_]+" className={`w-full border rounded p-2 text-sm ${inputClass}`} placeholder="e.g. my_shop_db" value={dbName} onChange={e => setDbName(e.target.value)} />
                                <p className="text-[10px] text-slate-500 mt-1">Only lowercase letters, numbers, and underscores.</p>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${subTextClass}`}>Email</label>
                                <input type="email" required className={`w-full border rounded p-2 text-sm ${inputClass}`} placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label className={`block text-xs font-bold uppercase mb-1 ${subTextClass}`}>Password</label>
                                <input type="password" required className={`w-full border rounded p-2 text-sm ${inputClass}`} placeholder="User Password" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-xs font-bold uppercase mb-1 ${subTextClass}`}>Country</label>
                                    <select className={`w-full border rounded p-2 text-sm ${inputClass}`} value={country} onChange={e => setCountry(e.target.value)}>
                                        <option value="US">United States</option>
                                        <option value="TH">Thailand</option>
                                        <option value="SG">Singapore</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-xs font-bold uppercase mb-1 ${subTextClass}`}>Demo Data</label>
                                    <div className="flex items-center h-full">
                                        <input type="checkbox" checked={isDemo} onChange={e => setIsDemo(e.target.checked)} className="mr-2"/>
                                        <span className={`text-sm ${headerTextClass}`}>Load Demo Data</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" fullWidth onClick={() => setMode('LIST')} className={isEmbedded ? "text-slate-400 hover:text-white" : ""}>Cancel</Button>
                                <Button type="submit" fullWidth disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Provisioning...</span>
                                    ) : 'Create Database'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {mode === 'LIST' && (
                    <div className="space-y-4">
                        {databases.length === 0 ? (
                            <div className={`text-center py-12 ${subTextClass}`}>
                                <Database className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                                <p>No databases found.</p>
                                <Button size="sm" variant="ghost" onClick={() => setMode('CREATE')} className="mt-2 text-brand-500">Create the first one</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {databases.map(db => (
                                    <div key={db.id} className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow group ${itemBgClass}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${isEmbedded ? 'bg-slate-700 text-slate-400 group-hover:bg-brand-900 group-hover:text-brand-500' : 'bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600'}`}>
                                                <Database className="w-5 h-5"/>
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${headerTextClass}`}>{db.name}</h3>
                                                <div className={`flex gap-4 text-xs ${subTextClass}`}>
                                                    <span className="flex items-center gap-1"><Globe className="w-3 h-3"/> {db.language} ({db.country_code})</span>
                                                    <span>{db.createdAt}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" onClick={() => selectDatabase(db)}>
                                                Select
                                            </Button>
                                            <button onClick={() => handleDelete(db.id)} className="p-2 text-slate-400 hover:text-red-500 rounded transition-colors" title="Drop Database">
                                                <Trash2 className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer - Only show if NOT embedded (Dashboard usually doesn't need 'Back to Login' inside itself) */}
            {!isEmbedded && (
                <div className="bg-slate-50 border-t px-6 py-4 flex justify-between items-center text-xs text-slate-500">
                    <button onClick={onBack} className="flex items-center gap-1 hover:text-slate-800">
                        <ArrowLeft className="w-3 h-3"/> Back to Login
                    </button>
                    <div className="flex gap-2">
                        <span className="flex items-center gap-1"><Lock className="w-3 h-3"/> Master Password Protected</span>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};