
import {InvoiceData, InvoiceItem} from '../types/types'
export const parseDrawInvoice = (text: string): InvoiceData[] => {
  // Split by invoice sections
  const invoiceSections = text.split(/The document\(s\) that follow are for:/);
  const invoices: InvoiceData[] = [];

  for (let i = 1; i < invoiceSections.length; i++) {
    const section = invoiceSections[i];
    
    try {
      const invoice: InvoiceData = {
        // Basic Invoice Info
        vendorId: extractValue(section, /Vendor ID\s*([^\n]+)/),
        vendorName: extractValue(section, /Vendor Name\s*([^\n]+)/),
        invoiceNumber: extractValue(section, /Invoice Number\s*([^\n]+)/),
        invoiceDate: extractValue(section, /Invoice Date\s*([^\n]+)/),
        invoiceAmount: parseFloat(extractValue(section, /Invoice Amount\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        
        // Status Info
        invoiceStatus: extractValue(section, /Invoice Status\s*([^\n]+)/),
        partnerStatus: extractValue(section, /Partner Status\s*([^\n]+)/),
        paymentDue: extractValue(section, /Payment Due\s*([^\n]+)/),
        
        // Customer Info
        customer: extractValue(section, /Customer\s*([^\n]+)/),
        customerAddress: extractCustomerAddress(section),
        accountNumber: extractValue(section, /Account #\s*([^\n]+)/),
        poNumber: extractValue(section, /PO #\s*([^\n]+)/),
        
        // Financial Info
        subtotal: parseFloat(extractValue(section, /Sub Total\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        tax: parseFloat(extractValue(section, /Tax\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        shipping: parseFloat(extractValue(section, /Shipping\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        grandTotal: parseFloat(extractValue(section, /Grand Total\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        mirn: extractValue(section, /MIRN\s*([^\n]+)/),
        
        // Items
        items: extractInvoiceItems(section)
      };
      
      invoices.push(invoice);
    } catch (error) {
      console.error('Error parsing invoice section:', error);
    }
  }

  return invoices;
};

const extractValue = (text: string, pattern: RegExp): string => {
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
};

const extractCustomerAddress = (text: string): string => {
  const customerMatch = text.match(/Customer\s*([^#]+)#/);
  if (customerMatch) {
    return customerMatch[1].trim().replace(/\n/g, ', ');
  }
  return '';
};

const extractInvoiceItems = (text: string): InvoiceItem[] => {
  const items: InvoiceItem[] = [];
  
  // Look for item patterns - this is complex due to the format
  const lines = text.split('\n');
  let currentItem: Partial<InvoiceItem> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for SKU pattern
    const skuMatch = line.match(/SKU\s*([^\s]+)/);
    if (skuMatch) {
      currentItem.sku = skuMatch[1];
    }
    
    // Look for quantity pattern
    const qtyMatch = line.match(/(\d+\.?\d*)\s*EA/);
    if (qtyMatch) {
      currentItem.qty = parseFloat(qtyMatch[1]);
    }
    
    // Look for price pattern
    const priceMatch = line.match(/Price\s*(\d+\.?\d*)/);
    if (priceMatch) {
      currentItem.price = parseFloat(priceMatch[1]);
    }
    
    // Look for description (usually after SKU)
    if (currentItem.sku && line.includes('Description')) {
      const descMatch = line.match(/Description\s+(.+)/);
      if (descMatch) {
        currentItem.description = descMatch[1].trim();
      }
    }
    
    // Look for Ext value
    const extMatch = line.match(/Ext\s*(\d+\.?\d*)/);
    if (extMatch) {
      currentItem.ext = parseFloat(extMatch[1]);
    }
    
    // Look for Nontaxable
    const nontaxMatch = line.match(/Nontaxable\s*(\w+)/);
    if (nontaxMatch) {
      currentItem.nontaxable = nontaxMatch[1];
      
      // When we find nontaxable, we likely have a complete item
      if (currentItem.sku && currentItem.qty !== undefined) {
        items.push({
          qty: currentItem.qty || 0,
          sku: currentItem.sku || '',
          description: currentItem.description || '',
          price: currentItem.price || 0,
          ext: currentItem.ext || 0,
          nontaxable: currentItem.nontaxable || ''
        });
        currentItem = {};
      }
    }
  }
  
  return items;
};
