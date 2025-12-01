import React, { useState } from 'react';
import { Container, Wifi, Box, Activity, FileText, Shield, Users, Lock, CheckCircle, XCircle, Save, Database } from 'lucide-react';
import { Button } from '../../components/Button';
import { useSystem } from '../../contexts/SystemContext';
import { DockerContainer, AppModule, UserRole, RoleDefinition, Permission } from '../../types';
import { DatabaseManager } from '../auth/DatabaseManager';

const DOCKER_CONTAINERS: DockerContainer[] = [
  { id: 'c1', name: 'spos-frontend', image: 'spos-web:latest', status: 'running', cpuUsage: '0.5%', memUsage: '45MB', port: '80:80', uptime: '4d 2h' },
  { id: 'c2', name: 'spos-api-gateway', image: 'nginx:alpine', status: 'running', cpuUsage: '1.2%', memUsage: '120MB', port: '8080:8080', uptime: '12d 5h' },
  { id: 'c3', name: 'spos-core-service', image: 'golang:1.21', status: 'running', cpuUsage: '2.5%', memUsage: '250MB', port: 'internal', uptime: '12d 5h' },
  { id: 'c4', name: 'spos-worker-queue', image: 'redis:7.0', status: 'running', cpuUsage: '0.8%', memUsage: '80MB', port: '6379', uptime: '15d 1h' },
  { id: 'c5', name: 'spos-db-primary', image: 'postgres:16', status: 'running', cpuUsage: '4.1%', memUsage: '1.2GB', port: '5432', uptime: '30d' },
];

export const DockerDashboard: React.FC = () => {
  const { logout, jobQueue, completedJobsCount, roleDefinitions, updateRoleDefinition } = useSystem();
  const [activeTab, setActiveTab] = useState<'DOCKER' | 'SECURITY' | 'DATABASES'>('DOCKER');
  
  // Role Editing State
  const [selectedRole, setSelectedRole] = useState<UserRole>('INVENTORY_MANAGER');

  const handlePermissionToggle = (role: UserRole, module: AppModule, action: 'read' | 'write' | 'delete') => {
      const currentDef = roleDefinitions.find(r => r.role === role);
      if (!currentDef) return;

      const newPerms = { ...currentDef.permissions };
      newPerms[module] = { ...newPerms[module], [action]: !newPerms[module][action] };

      updateRoleDefinition({ ...currentDef, permissions: newPerms });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-mono text-sm">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <Container className="text-brand-500 w-6 h-6"/> 
            <span className="font-bold text-lg">Sunmart <span className="text-slate-500">Orchestrator</span></span>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
             <button onClick={() => setActiveTab('DOCKER')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'DOCKER' ? 'bg-brand-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}>Infrastructure</button>
             <button onClick={() => setActiveTab('SECURITY')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'SECURITY' ? 'bg-brand-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}>Role & Security</button>
             <button onClick={() => setActiveTab('DATABASES')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${activeTab === 'DATABASES' ? 'bg-brand-600 text-white' : 'hover:bg-slate-700 text-slate-400'}`}>Databases</button>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-green-400"><Wifi className="w-3 h-3"/> Node: sunmart-prod-01</span>
          <Button variant="outline" size="sm" onClick={logout} className="border-slate-700 hover:bg-slate-800 text-slate-300">Logout</Button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* --- DATABASES TAB --- */}
        {activeTab === 'DATABASES' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Database className="w-5 h-5"/> Tenant Database Management</h2>
                        <p className="text-slate-400 text-xs mt-1">Create, Drop, and Backup Tenant Databases (PostgreSQL).</p>
                    </div>
                </div>
                <DatabaseManager isEmbedded />
            </div>
        )}

        {/* --- SECURITY / RBAC TAB --- */}
        {activeTab === 'SECURITY' && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Shield className="w-5 h-5"/> Access Control Lists (ACL)</h2>
                        <p className="text-slate-400 text-xs mt-1">Configure permission matrix for Tenant Roles.</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6 h-[600px]">
                    {/* Role Selector */}
                    <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-slate-800 font-bold text-slate-400 uppercase text-xs">Roles</div>
                        <div className="p-2 space-y-1">
                            {roleDefinitions.filter(r => r.role !== 'SUPER_ADMIN').map(def => (
                                <button
                                    key={def.role}
                                    onClick={() => setSelectedRole(def.role)}
                                    className={`w-full text-left px-4 py-3 rounded flex items-center justify-between ${selectedRole === def.role ? 'bg-brand-900/40 text-brand-400 border border-brand-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    <span className="font-bold">{def.name}</span>
                                    <Users className="w-4 h-4 opacity-50"/>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Matrix Editor */}
                    <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                         <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                             <div>
                                <h3 className="text-lg font-bold text-white">{roleDefinitions.find(r => r.role === selectedRole)?.name}</h3>
                                <p className="text-slate-400 text-xs">{roleDefinitions.find(r => r.role === selectedRole)?.description}</p>
                             </div>
                             <div className="flex gap-2">
                                 <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1 rounded border border-slate-700 flex items-center gap-2"><Lock className="w-3 h-3"/> Configurable by SuperAdmin</div>
                             </div>
                         </div>
                         
                         <div className="p-0 flex-1 overflow-y-auto">
                             <table className="w-full text-left">
                                 <thead className="bg-slate-800/30 text-slate-400 text-xs uppercase border-b border-slate-800">
                                     <tr>
                                         <th className="px-6 py-4 w-1/3">Module / App</th>
                                         <th className="px-6 py-4 text-center w-1/6">Read</th>
                                         <th className="px-6 py-4 text-center w-1/6">Write / Create</th>
                                         <th className="px-6 py-4 text-center w-1/6">Delete</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-800">
                                     {Object.entries(roleDefinitions.find(r => r.role === selectedRole)?.permissions || {}).map(([module, perms]) => {
                                         const p = perms as Permission;
                                         return (
                                         <tr key={module} className="hover:bg-slate-800/30 transition-colors">
                                             <td className="px-6 py-4">
                                                 <span className="font-bold text-white">{module}</span>
                                             </td>
                                             <td className="px-6 py-4 text-center">
                                                 <button 
                                                    onClick={() => handlePermissionToggle(selectedRole, module as AppModule, 'read')}
                                                    className={`transition-all duration-200 ${p.read ? 'text-green-400 scale-110' : 'text-slate-600 grayscale opacity-50'}`}
                                                 >
                                                    {p.read ? <CheckCircle className="w-5 h-5 mx-auto"/> : <XCircle className="w-5 h-5 mx-auto"/>}
                                                 </button>
                                             </td>
                                             <td className="px-6 py-4 text-center">
                                                 <button 
                                                    onClick={() => handlePermissionToggle(selectedRole, module as AppModule, 'write')}
                                                    className={`transition-all duration-200 ${p.write ? 'text-brand-400 scale-110' : 'text-slate-600 grayscale opacity-50'}`}
                                                 >
                                                    {p.write ? <CheckCircle className="w-5 h-5 mx-auto"/> : <XCircle className="w-5 h-5 mx-auto"/>}
                                                 </button>
                                             </td>
                                             <td className="px-6 py-4 text-center">
                                                 <button 
                                                    onClick={() => handlePermissionToggle(selectedRole, module as AppModule, 'delete')}
                                                    className={`transition-all duration-200 ${p.delete ? 'text-red-400 scale-110' : 'text-slate-600 grayscale opacity-50'}`}
                                                 >
                                                    {p.delete ? <CheckCircle className="w-5 h-5 mx-auto"/> : <XCircle className="w-5 h-5 mx-auto"/>}
                                                 </button>
                                             </td>
                                         </tr>
                                     )})}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- DOCKER TAB (Existing) --- */}
        {activeTab === 'DOCKER' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8">
                <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white"><Box className="w-5 h-5"/> Containers</h2>
                    <span className="text-xs bg-brand-900 text-brand-300 px-2 py-1 rounded">Stack: spos-prod</span>
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                        <tr>
                            <th className="p-4">State</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Image</th>
                            <th className="p-4">Port</th>
                            <th className="p-4">CPU</th>
                            <th className="p-4">Mem</th>
                            <th className="p-4">Uptime</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                        {DOCKER_CONTAINERS.map(c => (
                            <tr key={c.id} className="hover:bg-slate-800/50">
                            <td className="p-4"><span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-green-900/50 text-green-400 border border-green-800"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>{c.status}</span></td>
                            <td className="p-4 font-bold text-white">{c.name}</td>
                            <td className="p-4 text-slate-400">{c.image}</td>
                            <td className="p-4 text-brand-400">{c.port}</td>
                            <td className="p-4">{c.cpuUsage}</td>
                            <td className="p-4">{c.memUsage}</td>
                            <td className="p-4">{c.uptime}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><Activity className="w-5 h-5"/> Redis Queue Monitor</h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-6 h-64 flex flex-col">
                        <div className="flex justify-between mb-4">
                            <div className="text-xs text-slate-400">Worker Status: <span className="text-green-400">Active</span></div>
                            <div className="text-xs text-slate-400">Processed: {completedJobsCount}</div>
                        </div>
                        <div className="flex-1 border border-dashed border-slate-800 rounded bg-black/20 p-2 overflow-x-auto flex gap-2 items-center">
                            {jobQueue.length === 0 ? (
                                <span className="text-slate-600 w-full text-center">Queue Empty</span>
                            ) : (
                                jobQueue.map(j => (
                                    <div key={j.id} className="min-w-[120px] bg-brand-900/50 border border-brand-800 p-2 rounded text-xs animate-pulse">
                                    <div className="font-bold text-brand-300">{j.type}</div>
                                    <div className="text-[10px] text-slate-500">{j.id}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    </div>
                    
                    <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white"><FileText className="w-5 h-5"/> System Logs</h2>
                    <div className="bg-black border border-slate-800 rounded-lg overflow-hidden p-4 h-64 font-mono text-xs text-slate-400 overflow-y-auto">
                        <div className="text-green-500">[INFO] 2024-05-20 10:00:01 - Worker-01 started</div>
                        <div className="text-blue-500">[DEBUG] 2024-05-20 10:00:05 - Connected to postgres:5432</div>
                        <div className="text-slate-500">[LOG] 2024-05-20 10:05:12 - GET /api/v1/products 200 OK</div>
                        {jobQueue.map(j => (
                            <div key={j.id} className="text-yellow-500">[QUEUE] Processing job {j.id} type={j.type}</div>
                        ))}
                        {completedJobsCount > 0 && <div className="text-green-500">[SUCCESS] Job completed successfully. Syncing DB.</div>}
                    </div>
                    </div>
                </section>
            </div>
        )}
      </main>
    </div>
  );
};