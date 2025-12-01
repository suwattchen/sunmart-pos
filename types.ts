import React from 'react';

// SPOS Enterprise Data Models (Sunmart Point of Sale)

export interface SPOSProduct {
  id: number;
  display_name: string;
  lst_price: number; // Sale Price
  standard_price: number; // Cost
  categ_id: [number, string]; // [id, name]
  taxes_id: number[];
  barcode?: string;
  default_code?: string; // Internal Reference
  description_sale?: string;
  image_url?: string;
  qty_available: number; // Stock Level
  uom_id?: [number, string];
  tracking: 'none' | 'serial' | 'lot';
  tenant_id: string; // Multi-tenant extension
}

export interface SPOSCategory {
  id: number;
  name: string;
  parent_id?: [number, string] | boolean; // Odoo style: false if root
}

export interface SPOSPartner {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  barcode?: string;
  points?: number; // Loyalty extension
  tenant_id: string;
}

export interface SPOSTax {
  id: number;
  name: string;
  amount: number;
  price_include: boolean;
}

// SPOS Session Data
export interface SPOSSession {
  id: number;
  name: string;
  user_id: [number, string];
  config_id: [number, string];
  start_at: string;
  stop_at?: string;
  state: 'opening_control' | 'opened' | 'closing_control' | 'closed';
  cash_register_balance_start: number;
  cash_register_balance_end_real?: number;
  tenant_id: string;
}

// Notebook Tabs (Odoo Form View)
export interface SPOSNotebookTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

// Payment Line
export interface PaymentLine {
    payment_method: { id: number; name: string; type: 'cash' | 'bank' };
    amount: number;
}

// --- RBAC & USER TYPES ---

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'TENANT_ADMIN' 
  | 'INVENTORY_MANAGER' 
  | 'SALES_MANAGER' 
  | 'CASHIER';

export type AppModule = 'POS' | 'INVENTORY' | 'ANALYTICS' | 'SETTINGS' | 'EMPLOYEES' | 'WEBSITE' | 'AI';

export interface Permission {
  read: boolean;
  write: boolean; // Create/Update
  delete: boolean;
}

export interface RoleDefinition {
  role: UserRole;
  name: string;
  description: string;
  permissions: Record<AppModule, Permission>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  tenantId: string;
  avatar: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  ownerEmail: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

// --- DATABASE MANAGER TYPES (The Odoo Way) ---
export interface SPOSDatabase {
    id: string;
    name: string; // The DB Name (e.g., sunmart_shop1)
    email: string; // The Admin Email
    country_code: string;
    language: string;
    createdAt: string;
    isDemo: boolean;
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'restarting' | 'stopped';
  cpuUsage: string;
  memUsage: string;
  port: string;
  uptime: string;
}

export interface QueueJob {
  id: string;
  type: 'SALE_ORDER' | 'INVENTORY_SYNC' | 'SESSION_CLOSE';
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  tenantId: string;
}

export interface AIPromotionSuggestion {
  title: string;
  rationale: string;
  suggestedAction: string;
  targetAudience: string;
  expectedUplift: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ReceiptData {
  storeName: string;
  cashier: string;
  timestamp: string;
  orderNumber: string;
  order: {
    items: {
      name: string;
      quantity: number;
      price: number;
    }[];
    subtotal: number;
    tax: number;
    total: number;
  };
}

export type BackOfficeTab = 'DASHBOARD' | 'ANALYTICS' | 'PRODUCTS';

export interface DashboardOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  items: any[];
}