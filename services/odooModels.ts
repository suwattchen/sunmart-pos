
import { SPOSProduct, SPOSPartner, SPOSSession, SPOSTax } from '../types';
import { SPOSLocalDB } from './odooDB';

// --- ORDER LINE (SPOS Core Logic) ---
export class SPOSOrderline {
  product: SPOSProduct;
  quantity: number;
  price: number;
  discount: number;
  selected: boolean;
  internalId: string;

  constructor(product: SPOSProduct, quantity: number = 1) {
    this.product = product;
    this.quantity = quantity;
    this.price = product.lst_price;
    this.discount = 0;
    this.selected = false;
    this.internalId = Math.random().toString(36).substr(2, 9);
  }

  set_quantity(qty: number) {
    this.quantity = qty;
  }

  set_price(price: number) {
    this.price = price;
  }

  set_discount(discount: number) {
    this.discount = Math.min(Math.max(discount, 0), 100);
  }

  get_price_without_tax(): number {
    return this.get_all_prices().priceWithoutTax;
  }

  get_price_with_tax(): number {
    return this.get_all_prices().priceWithTax;
  }

  get_tax(): number {
    return this.get_all_prices().tax;
  }

  // Tax calculation engine
  get_all_prices() {
    const currencyPrecision = 2;
    const price_unit = this.price * (1 - this.discount / 100);
    
    // Default VAT 7% for Thailand (configurable in settings)
    const taxRate = 0.07; 
    
    const tax = price_unit * this.quantity * taxRate;
    const priceWithTax = (price_unit * this.quantity) + tax;
    const priceWithoutTax = price_unit * this.quantity;

    return {
      priceWithTax: priceWithTax,
      priceWithoutTax: priceWithoutTax,
      tax: tax,
    };
  }
}

// --- ORDER (Transaction Management) ---
export class SPOSOrder {
  id: string;
  name: string;
  orderlines: SPOSOrderline[];
  client: SPOSPartner | null;
  paymentlines: any[];
  pos: SPOSEngine;
  temporary: boolean;
  date_order: string;

  constructor(pos: SPOSEngine) {
    this.id = `Order-${Date.now()}`;
    this.name = `New Order`;
    this.orderlines = [];
    this.client = null;
    this.paymentlines = [];
    this.pos = pos;
    this.temporary = true;
    this.date_order = new Date().toISOString();
  }

  add_product(product: SPOSProduct, options: { quantity?: number, price?: number, merge?: boolean } = {}) {
    if (options.merge !== false) {
      const existingLine = this.orderlines.find(line => line.product.id === product.id && line.price === product.lst_price && line.discount === 0);
      if (existingLine) {
        existingLine.set_quantity(existingLine.quantity + (options.quantity || 1));
        return existingLine;
      }
    }
    const line = new SPOSOrderline(product, options.quantity || 1);
    this.orderlines.push(line);
    this.select_orderline(line);
    return line;
  }

  get_selected_orderline(): SPOSOrderline | null {
    return this.orderlines.find(l => l.selected) || (this.orderlines.length > 0 ? this.orderlines[this.orderlines.length-1] : null);
  }

  select_orderline(line: SPOSOrderline | null) {
    this.orderlines.forEach(l => l.selected = false);
    if (line) line.selected = true;
  }

  remove_orderline(line: SPOSOrderline) {
    this.orderlines = this.orderlines.filter(l => l.internalId !== line.internalId);
    if (this.orderlines.length > 0) {
      this.select_orderline(this.orderlines[this.orderlines.length - 1]);
    }
  }

  get_total_with_tax(): number {
    return this.orderlines.reduce((sum, line) => sum + line.get_price_with_tax(), 0);
  }

  get_total_without_tax(): number {
    return this.orderlines.reduce((sum, line) => sum + line.get_price_without_tax(), 0);
  }

  get_total_tax(): number {
    return this.orderlines.reduce((sum, line) => sum + line.get_tax(), 0);
  }

  set_client(client: SPOSPartner | null) {
    this.client = client;
  }

  get_client(): SPOSPartner | null {
    return this.client;
  }
  
  export_as_JSON() {
    return {
      name: this.name,
      amount_total: this.get_total_with_tax(),
      amount_tax: this.get_total_tax(),
      lines: this.orderlines.map(l => ({
        product_id: l.product.id,
        qty: l.quantity,
        price_unit: l.price,
        discount: l.discount
      })),
      partner_id: this.client ? this.client.id : false,
      date_order: this.date_order
    };
  }
}

// --- SPOS ENGINE (The Core Logic) ---
export class SPOSEngine {
  db: SPOSLocalDB;
  orders: SPOSOrder[];
  selectedOrderId: string | null;
  session: SPOSSession | null;
  
  constructor() {
    this.db = new SPOSLocalDB();
    this.orders = [];
    this.selectedOrderId = null;
    this.session = null;
  }

  // Load Data into Core Engine
  load_server_data(products: SPOSProduct[], categories: any[], partners: SPOSPartner[]) {
    this.db.add_categories(categories);
    this.db.add_products(products);
    this.db.add_partners(partners);
  }

  add_new_order() {
    const order = new SPOSOrder(this);
    this.orders.push(order);
    this.set_order(order);
    return order;
  }

  get_order(): SPOSOrder | null {
    return this.orders.find(o => o.id === this.selectedOrderId) || null;
  }

  set_order(order: SPOSOrder) {
    this.selectedOrderId = order.id;
  }

  delete_current_order() {
    const order = this.get_order();
    if (order) {
      this.orders = this.orders.filter(o => o.id !== order.id);
      if (this.orders.length > 0) {
        this.set_order(this.orders[0]);
      } else {
        this.add_new_order();
      }
    }
  }

  push_orders(order: SPOSOrder) {
    // Queue synchronization logic
    console.log("[SPOS Engine] Syncing order to Sunmart Cloud...", order.export_as_JSON());
  }
}
