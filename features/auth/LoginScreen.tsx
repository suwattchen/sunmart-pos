import React, { useState } from 'react';
import { Store, Check, Zap, Shield, ArrowRight, X, LayoutGrid, Users, BarChart3, Globe, Database } from 'lucide-react';
import { useSystem } from '../../contexts/SystemContext';
import { Button } from '../../components/Button';

export const LoginScreen: React.FC = () => {
  const { login, databases } = useSystem();
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        await login(email, password);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const openAuth = () => {
    setShowModal(true);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-brand-100">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Sunmart<span className="text-brand-600">.POS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            <a href="#enterprise" className="hover:text-brand-600 transition-colors">Enterprise</a>
            <a href="#" className="hover:text-brand-600 transition-colors" onClick={(e) => {e.preventDefault(); alert("Contact: sales@sunmart.online");}}>Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={openAuth} className="text-sm font-bold text-slate-700 hover:text-brand-600 px-4 py-2">
              Log in
            </button>
            <Button onClick={openAuth} size="sm" className="shadow-lg shadow-brand-500/30 rounded-full px-6">
              Start Free Trial
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-50 rounded-full blur-[120px] -mr-40 -mt-40 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] -ml-20 -mb-20 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold mb-6">
               <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
               New: Gemini AI Integration v2.0
             </div>
             <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
               The OS for <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-500">Modern Retail</span>
             </h1>
             <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
               Deploy your own Enterprise POS & ERP system in minutes. 
               Powered by Sunmart SPOS Engine and Google Gemini AI for unmatched scalability and intelligence.
             </p>
             <div className="flex flex-col sm:flex-row gap-4">
               <Button size="xl" onClick={openAuth} className="shadow-xl shadow-brand-500/40 rounded-full px-8">
                 Start 14-Day Free Trial <ArrowRight className="w-5 h-5 ml-2"/>
               </Button>
               <Button size="xl" variant="outline" onClick={openAuth} className="rounded-full px-8 bg-white/50 backdrop-blur border-slate-300">
                 View Live Demo
               </Button>
             </div>
             <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="user"/>
                  ))}
                </div>
                <p>Trusted by <span className="font-bold text-slate-800">500+</span> businesses</p>
             </div>
          </div>
          <div className="relative">
             <div className="relative bg-slate-900 rounded-2xl p-2 shadow-2xl shadow-slate-900/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 aspect-[4/3] flex items-center justify-center relative">
                   {/* Abstract Dashboard UI */}
                   <div className="absolute inset-0 bg-slate-900">
                      <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="p-6 grid grid-cols-3 gap-4">
                         <div className="col-span-2 h-32 bg-slate-800 rounded-lg animate-pulse"></div>
                         <div className="col-span-1 h-32 bg-slate-800 rounded-lg animate-pulse delay-75"></div>
                         <div className="col-span-1 h-32 bg-slate-800 rounded-lg animate-pulse delay-100"></div>
                         <div className="col-span-2 h-32 bg-slate-800 rounded-lg animate-pulse delay-150"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="text-center">
                           <LayoutGrid className="w-16 h-16 text-brand-500 mx-auto mb-4 opacity-80"/>
                           <p className="text-slate-400 font-mono text-sm">Sunmart Enterprise Dashboard</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold mb-4">Enterprise Grade by Default</h2>
               <p className="text-slate-500 max-w-2xl mx-auto">Why choose Sunmart SPOS? We bring the power of Enterprise ERP logic with the speed of a modern React frontend.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { icon: LayoutGrid, title: "Modular SPOS ERP", desc: "Start with POS, expand to Inventory, Accounting, and HR. All integrated in one database." },
                 { icon: Zap, title: "Gemini AI Core", desc: "Real-time sales analysis and upsell suggestions powered by Google's latest LLM." },
                 { icon: Shield, title: "Docker Isolated", desc: "Every tenant gets their own schema and resources. Zero data leakage, maximum security." }
               ].map((f, i) => (
                 <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-6">
                      <f.icon className="w-6 h-6"/>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
                <p className="text-slate-500">No hidden fees. Scale as you grow.</p>
              </div>
              <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                 <button className="px-4 py-2 bg-white rounded-md shadow-sm text-sm font-bold text-slate-800">Monthly</button>
                 <button className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-200 rounded-md transition">Yearly (-20%)</button>
              </div>
           </div>
           <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Starter", price: "$0", feat: ["1 POS Terminal", "500 Products", "Basic Reports"], btn: "Start Free" },
                { name: "Professional", price: "$49", feat: ["Unlimited POS", "Unlimited Products", "AI Consultant", "API Access"], btn: "Go Pro", highlight: true },
                { name: "Enterprise", price: "Custom", feat: ["Dedicated Docker Node", "SLA 99.9%", "Custom Mods", "24/7 Support"], btn: "Contact Sales" }
              ].map((p, i) => (
                <div key={i} className={`p-8 rounded-2xl border ${p.highlight ? 'border-brand-500 bg-brand-50/50 relative' : 'border-slate-200 bg-white'}`}>
                   {p.highlight && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>}
                   <h3 className="font-bold text-lg mb-2">{p.name}</h3>
                   <div className="text-4xl font-bold mb-6">{p.price}<span className="text-sm font-normal text-slate-500">/mo</span></div>
                   <ul className="space-y-4 mb-8">
                      {p.feat.map((f, j) => (
                        <li key={j} className="flex items-center gap-3 text-sm text-slate-600">
                          <Check className="w-4 h-4 text-brand-600"/> {f}
                        </li>
                      ))}
                   </ul>
                   <Button fullWidth variant={p.highlight ? 'primary' : 'outline'} onClick={openAuth}>
                     {p.btn}
                   </Button>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1">
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center">
                    <Store className="w-3 h-3 text-white"/>
                  </div>
                  <span className="font-bold">Sunmart.POS</span>
               </div>
               <p className="text-slate-500 text-sm">Empowering retailers with enterprise-grade technology.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Overview</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
               <h4 className="font-bold mb-4">Global Infrastructure</h4>
               <div className="flex items-center gap-2 text-sm text-slate-400">
                 <Globe className="w-4 h-4"/> Multi-region Docker Swarm
               </div>
               <div className="flex items-center gap-2 text-sm text-green-500 mt-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> All Systems Operational
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-center text-xs text-slate-600 flex justify-between">
            <span>&copy; 2024 Sunmart Enterprise Systems. All rights reserved.</span>
         </div>
      </footer>

      {/* Auth Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5"/>
              </button>
              
              <div className="p-8">
                 <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900">Sign In</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                       <Database className="w-4 h-4 text-brand-600"/>
                       <span className="text-sm font-bold text-brand-600">{databases[0]?.name || 'Demo Database'}</span>
                    </div>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                        <input 
                          type="email" required 
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                          placeholder="admin@example.com"
                          value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                        <input 
                          type="password" required 
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                          placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><Shield className="w-4 h-4"/> {error}</div>}

                    <Button type="submit" fullWidth size="lg" className="mt-4 bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20">
                      {isLoading ? 'Authenticating...' : 'Login'}
                    </Button>
                 </form>

                 {/* Demo Hint */}
                 <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 font-mono">DEMO: suwattchen@gmail.com / Sunmart@2024</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};