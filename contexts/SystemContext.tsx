import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Tenant, QueueJob, SPOSProduct, SPOSSession, SPOSPartner, DashboardOrder, SPOSCategory, SPOSDatabase, RoleDefinition, AppModule, UserRole } from '../types';
import { SPOSEngine, SPOSOrder } from '../services/odooModels';

// SEED DATA (Simulating Sunmart Cloud Backend)
const SEED_CATEGORIES: SPOSCategory[] = [
  { id: 1, name: 'Drinks', parent_id: false },
  { id: 2, name: 'Food', parent_id: false },
  { id: 3, name: 'Coffee', parent_id: [1, 'Drinks'] },
  { id: 4, name: 'Tea', parent_id: [1, 'Drinks'] },
  { id: 5, name: 'Pastries', parent_id: [2, 'Food'] },
];

const SEED_PRODUCTS: SPOSProduct[] = [
  { id: 1, display_name: 'Espresso', lst_price: 2.50, standard_price: 0.5, categ_id: [3, 'Coffee'], taxes_id: [1], qty_available: 100, tenant_id: 't1', image_url: 'https://picsum.photos/seed/esp/200', tracking: 'none' },
  { id: 2, display_name: 'Latte', lst_price: 3.50, standard_price: 0.8, categ_id: [3, 'Coffee'], taxes_id: [1], qty_available: 80, tenant_id: 't1', image_url: 'https://picsum.photos/seed/lat/200', tracking: 'none' },
  { id: 3, display_name: 'Green Tea', lst_price: 3.00, standard_price: 0.7, categ_id: [4, 'Tea'], taxes_id: [1], qty_available: 50, tenant_id: 't1', image_url: 'https://picsum.photos/seed/tea/200', tracking: 'none' },
  { id: 4, display_name: 'Croissant', lst_price: 2.75, standard_price: 0.6, categ_id: [5, 'Pastries'], taxes_id: [1], qty_available: 20, tenant_id: 't1', image_url: 'https://picsum.photos/seed/cro/200', tracking: 'none' },
  { id: 5, display_name: 'Bagel', lst_price: 2.00, standard_price: 0.4, categ_id: [5, 'Pastries'], taxes_id: [1], qty_available: 30, tenant_id: 't1', image_url: 'https://picsum.photos/seed/bag/200', tracking: 'none' },
];

const SEED_PARTNERS: SPOSPartner[] = [
  { id: 1, name: 'Walk-in Customer', tenant_id: 't1' },
  { id: 2, name: 'John Doe', email: 'john@example.com', points: 150, tenant_id: 't1' }
];

const SEED_USERS: User[] = [
  { id: 'u1', name: 'Mitchell Admin', email: 'admin@sunmart.online', role: 'TENANT_ADMIN', tenantId: 't1', avatar: '' },
  { id: 'u2', name: 'John Stock', email: 'inv@sunmart.online', role: 'INVENTORY_MANAGER', tenantId: 't1', avatar: '' },
  { id: 'u3', name: 'Sally Sales', email: 'sales@sunmart.online', role: 'SALES_MANAGER', tenantId: 't1', avatar: '' },
  { id: 'u4', name: 'Klara Cashier', email: 'cashier@sunmart.online', role: 'CASHIER', tenantId: 't1', avatar: '' },
];

const DEMO_DB: SPOSDatabase = {
    id: 'db_demo_01',
    name: 'sunmart_demo_db',
    email: 'suwattchen@gmail.com',
    country_code: 'TH',
    language: 'en_US',
    createdAt: new Date().toISOString().split('T')[0],
    isDemo: true
};

// --- DEFAULT RBAC CONFIGURATION ---
const DEFAULT_ROLES: RoleDefinition[] = [
  {
    role: 'SUPER_ADMIN',
    name: 'Platform Owner',
    description: 'Full access to Docker and Global Settings',
    permissions: {
      POS: { read: true, write: true, delete: true },
      INVENTORY: { read: true, write: true, delete: true },
      ANALYTICS: { read: true, write: true, delete: true },
      SETTINGS: { read: true, write: true, delete: true },
      EMPLOYEES: { read: true, write: true, delete: true },
      WEBSITE: { read: true, write: true, delete: true },
      AI: { read: true, write: true, delete: true },
    }
  },
  {
    role: 'TENANT_ADMIN',
    name: 'Administrator',
    description: 'Full access to Tenant Data',
    permissions: {
      POS: { read: true, write: true, delete: true },
      INVENTORY: { read: true, write: true, delete: true },
      ANALYTICS: { read: true, write: true, delete: true },
      SETTINGS: { read: true, write: true, delete: true },
      EMPLOYEES: { read: true, write: true, delete: true },
      WEBSITE: { read: true, write: true, delete: true },
      AI: { read: true, write: true, delete: true },
    }
  },
  {
    role: 'INVENTORY_MANAGER',
    name: 'Inventory Manager',
    description: 'Manage Products, Stock levels, and Website Catalog',
    permissions: {
      POS: { read: false, write: false, delete: false },
      INVENTORY: { read: true, write: true, delete: true },
      ANALYTICS: { read: true, write: false, delete: false },
      SETTINGS: { read: false, write: false, delete: false },
      EMPLOYEES: { read: false, write: false, delete: false },
      WEBSITE: { read: true, write: true, delete: false },
      AI: { read: false, write: false, delete: false },
    }
  },
  {
    role: 'SALES_MANAGER',
    name: 'Sales Manager',
    description: 'Manage POS Sessions, Sales Reports, and Cashiers',
    permissions: {
      POS: { read: true, write: true, delete: true },
      INVENTORY: { read: true, write: false, delete: false }, // Can see products but not edit
      ANALYTICS: { read: true, write: true, delete: false },
      SETTINGS: { read: false, write: false, delete: false },
      EMPLOYEES: { read: true, write: true, delete: false }, // Manage cashiers
      WEBSITE: { read: false, write: false, delete: false },
      AI: { read: true, write: true, delete: false },
    }
  },
  {
    role: 'CASHIER',
    name: 'Point of Sale User',
    description: 'Access to POS Interface only',
    permissions: {
      POS: { read: true, write: true, delete: false },
      INVENTORY: { read: true, write: false, delete: false },
      ANALYTICS: { read: false, write: false, delete: false },
      SETTINGS: { read: false, write: false, delete: false },
      EMPLOYEES: { read: false, write: false, delete: false },
      WEBSITE: { read: false, write: false, delete: false },
      AI: { read: false, write: false, delete: false },
    }
  }
];

interface SystemContextType {
  pos: SPOSEngine; // The SPOS Core Engine
  currentUser: User | null;
  currentOrder: SPOSOrder | null; // Derived from pos.get_order()
  refreshUI: number; // Trick to force React re-render when engine models change
  
  // Data access for Dashboard
  orders: DashboardOrder[];
  products: { id: number; name: string; cost: number; price: number; stock: number; }[];

  // Actions
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  syncData: () => void;
  
  // Database Manager
  databases: SPOSDatabase[];
  createDatabase: (config: any) => Promise<void>;
  deleteDatabase: (id: string) => Promise<void>;
  selectDatabase: (db: SPOSDatabase) => void;
  
  // RBAC
  roleDefinitions: RoleDefinition[];
  updateRoleDefinition: (role: RoleDefinition) => void;
  checkPermission: (module: AppModule, action: 'read' | 'write' | 'delete') => boolean;

  // Employees
  systemUsers: User[];
  addSystemUser: (user: User) => void;
  removeSystemUser: (id: string) => void;

  // Admin/Queue
  jobQueue: QueueJob[];
  completedJobsCount: number;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize the SPOS Engine (Persistent Object)
  const posRef = useRef<SPOSEngine>(new SPOSEngine());
  const [refreshUI, setRefreshUI] = useState(0); 

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [systemUsers, setSystemUsers] = useState<User[]>(SEED_USERS);
  const [jobQueue, setJobQueue] = useState<QueueJob[]>([]);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);
  
  // Database State
  const [databases, setDatabases] = useState<SPOSDatabase[]>([DEMO_DB]);
  const [selectedDB, setSelectedDB] = useState<SPOSDatabase>(DEMO_DB);

  // RBAC State
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>(DEFAULT_ROLES);

  // Helper to trigger react re-render when deep object changes
  const render = () => setRefreshUI(prev => prev + 1);

  // Load Data into Engine
  useEffect(() => {
    // In real app, this fetches from Sunmart API based on selectedDB
    console.log("Loading Sunmart Core Data for DB:", selectedDB.name);
    // Clear Engine First? In real world yes, here we just reload
    posRef.current = new SPOSEngine(); // Reset Engine on DB switch
    posRef.current.load_server_data(SEED_PRODUCTS, SEED_CATEGORIES, SEED_PARTNERS);
    posRef.current.add_new_order(); // Start with empty order
    render();
  }, [selectedDB]);

  // Sync Logic (The Bus)
  const syncData = () => {
    render();
  };

  const login = async (email: string, pass: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. Check Super Admin
    if (email === 'suwattchen@gmail.com' && pass === 'Sunmart@2024') {
        setCurrentUser({ id: 'admin', name: 'Super Admin', email, role: 'SUPER_ADMIN', tenantId: selectedDB.id, avatar: '' });
        return;
    }

    // 2. Check System Users
    const foundUser = systemUsers.find(u => u.email === email);
    if (foundUser) {
        setCurrentUser(foundUser);
        // Initialize Session for Cashiers
        if (foundUser.role === 'CASHIER' || foundUser.role === 'SALES_MANAGER' || foundUser.role === 'TENANT_ADMIN') {
             posRef.current.session = {
                id: 1, name: 'POS/2024/001', user_id: [1, foundUser.name], config_id: [1, 'Main'],
                start_at: new Date().toISOString(), state: 'opened',
                cash_register_balance_start: 100, tenant_id: selectedDB.id
            };
        }
        render();
        return;
    }

    // 3. Fallback/Mock for testing just in case
    if (email === 'admin@example.com') {
         setCurrentUser({ id: 'u1', name: 'Mitchell Admin', email, role: 'TENANT_ADMIN', tenantId: selectedDB.id, avatar: '' });
         return;
    }

    throw new Error("Invalid email or password");
  };

  const logout = () => {
    setCurrentUser(null);
  };
  
  // --- DATABASE MANAGEMENT LOGIC ---
  const createDatabase = async (config: any) => {
      // Simulate Docker Provisioning (Spinning up containers, running initdb)
      console.log("Provisioning Docker Container for:", config.name);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s simulated delay
      
      const newDB: SPOSDatabase = {
          id: `db_${Date.now()}`,
          name: config.name,
          email: config.email,
          country_code: config.country,
          language: 'en_US',
          createdAt: new Date().toISOString().split('T')[0],
          isDemo: config.isDemo
      };
      
      setDatabases(prev => [...prev, newDB]);
  };
  
  const deleteDatabase = async (id: string) => {
      console.log("Dropping Database Container:", id);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDatabases(prev => prev.filter(db => db.id !== id));
      if (selectedDB.id === id) {
          setSelectedDB(databases.find(db => db.id !== id) || DEMO_DB);
      }
  };
  
  const selectDatabase = (db: SPOSDatabase) => {
      setSelectedDB(db);
      // alert(`Switched to Database: ${db.name}`);
  };

  // --- RBAC LOGIC ---
  const updateRoleDefinition = (updatedRole: RoleDefinition) => {
    setRoleDefinitions(prev => prev.map(r => r.role === updatedRole.role ? updatedRole : r));
  };

  const checkPermission = (module: AppModule, action: 'read' | 'write' | 'delete'): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;

    const roleDef = roleDefinitions.find(r => r.role === currentUser.role);
    if (!roleDef) return false;

    // Check if module exists in permissions (safeguard)
    if (!roleDef.permissions[module]) return false;

    return roleDef.permissions[module][action];
  };

  // --- EMPLOYEE MGMT ---
  const addSystemUser = (user: User) => {
      setSystemUsers(prev => [...prev, user]);
  };

  const removeSystemUser = (id: string) => {
      setSystemUsers(prev => prev.filter(u => u.id !== id));
  };

  // Mappers for BackOffice
  const orders: DashboardOrder[] = posRef.current.orders.map(o => ({
    id: o.id,
    orderNumber: o.name,
    date: o.date_order,
    total: o.get_total_with_tax(),
    items: o.orderlines
  }));

  const products = posRef.current.db.getAllCategories().length >= 0 ? posRef.current.db.get_products_by_category(0).map(p => ({
    id: p.id,
    name: p.display_name,
    cost: p.standard_price,
    price: p.lst_price,
    stock: p.qty_available
  })) : [];


  return (
    <SystemContext.Provider value={{
      pos: posRef.current,
      currentUser,
      currentOrder: posRef.current.get_order(),
      refreshUI,
      orders,
      products,
      login, logout, syncData,
      jobQueue, completedJobsCount,
      // DB Manager Exports
      databases, createDatabase, deleteDatabase, selectDatabase,
      // RBAC Exports
      roleDefinitions, updateRoleDefinition, checkPermission,
      // Employees
      systemUsers, addSystemUser, removeSystemUser
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error("useSystem must be used within SystemProvider");
  return context;
};