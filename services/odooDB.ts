
import { SPOSProduct, SPOSCategory, SPOSPartner } from '../types';

/**
 * SPOS Local Database (Sunmart POS DB)
 * SPOS High-Performance Indexing engine.
 * Mirrors Odoo's client-side DB logic for fast lookups without server roundtrips.
 */
export class SPOSLocalDB {
  product_by_id: Record<number, SPOSProduct> = {};
  product_by_barcode: Record<string, SPOSProduct> = {};
  product_by_category_id: Record<number, number[]> = {};
  category_by_id: Record<number, SPOSCategory> = {};
  category_children: Record<number, number[]> = {}; // Index for breadcrumbs
  partner_by_id: Record<number, SPOSPartner> = {};
  root_category_id: number = 0;
  
  // Search Index Cache
  product_search_string: Record<number, string> = {}; 

  constructor() {
    this.product_by_id = {};
    this.product_by_barcode = {};
    this.product_by_category_id = {};
    this.category_by_id = {};
    this.category_children = {};
  }

  add_categories(categories: SPOSCategory[]) {
    for (const cat of categories) {
      this.category_by_id[cat.id] = cat;
      // Index children logic
      if (cat.parent_id && Array.isArray(cat.parent_id)) {
        const parentId = cat.parent_id[0];
        if (!this.category_children[parentId]) this.category_children[parentId] = [];
        this.category_children[parentId].push(cat.id);
      } else {
        // Root categories
        if (!this.category_children[0]) this.category_children[0] = [];
        this.category_children[0].push(cat.id);
      }
    }
  }

  add_products(products: SPOSProduct[]) {
    for (const product of products) {
      this.product_by_id[product.id] = product;
      
      if (product.barcode) {
        this.product_by_barcode[product.barcode] = product;
      }

      // Index by Category
      const catId = product.categ_id[0];
      if (!this.product_by_category_id[catId]) {
        this.product_by_category_id[catId] = [];
      }
      this.product_by_category_id[catId].push(product.id);

      // Create Search String (Name + Barcode + Internal Reference)
      let search_str = "";
      if (product.barcode) search_str += '|' + product.barcode;
      if (product.default_code) search_str += '|' + product.default_code;
      if (product.display_name) search_str += '|' + product.display_name.replace(/:/g,'');
      this.product_search_string[product.id] = search_str.toLowerCase();
    }
  }

  add_partners(partners: SPOSPartner[]) {
    for (const partner of partners) {
      this.partner_by_id[partner.id] = partner;
    }
  }

  get_product_by_id(id: number): SPOSProduct | undefined {
    return this.product_by_id[id];
  }

  get_product_by_barcode(barcode: string): SPOSProduct | undefined {
    return this.product_by_barcode[barcode];
  }

  // Improved Logic: Include products in subcategories if needed, or strict category
  get_products_by_category(categoryId: number): SPOSProduct[] {
    if (categoryId === 0) {
      return Object.values(this.product_by_id); // All products
    }
    const productIds = this.product_by_category_id[categoryId];
    if (!productIds) return [];
    return productIds.map(id => this.product_by_id[id]);
  }

  get_subcategories(parentId: number): SPOSCategory[] {
     const childIds = this.category_children[parentId];
     if (!childIds) return [];
     return childIds.map(id => this.category_by_id[id]);
  }

  get_category_parent(childId: number): number {
    const cat = this.category_by_id[childId];
    if (cat && cat.parent_id && Array.isArray(cat.parent_id)) {
      return cat.parent_id[0];
    }
    return 0;
  }

  get_partner_by_id(id: number): SPOSPartner | undefined {
    return this.partner_by_id[id];
  }

  getAllCategories(): SPOSCategory[] {
    return Object.values(this.category_by_id);
  }

  /**
   * Search products using the pre-computed search string
   */
  search_product(query: string): SPOSProduct[] {
    if (!query) return [];
    query = query.toLowerCase();
    const results: SPOSProduct[] = [];
    
    // Simple linear search over the index
    for (const id in this.product_search_string) {
      if (this.product_search_string[id].indexOf(query) !== -1) {
        results.push(this.product_by_id[id]);
      }
      if (results.length > 30) break; // Limit results for performance
    }
    return results;
  }
}
