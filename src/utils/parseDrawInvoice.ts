
import {InvoiceData, InvoiceItem} from '../types/types'
export const parseDrawInvoice = (text: string): InvoiceData[] => {
  // Split by invoice sections
  const invoiceSections = text.split(/The document\(s\) that follow are for:/);
  const invoices: InvoiceData[] = [];

  for (let i = 1; i < invoiceSections.length; i++) {
    const section = invoiceSections[i];

    try {
      // Extract summary table fields using robust regex
      const summary = extractSummaryFields(section);

      const invoice: InvoiceData = {
        // Basic Invoice Info
        vendorId: extractValue(section, /Vendor ID\s*([^\n]+)/),
        vendorName: extractValue(section, /Vendor Name\s*([^\n]+)/),
        invoiceNumber: extractValue(section,/Invoice Number\s*([^\n]+)/),
        invoiceDate: summary.invoiceDate || extractValue(section, /Invoice Date\s*([^\n]+)/),
        invoiceAmount: parseFloat(extractValue(section, /Invoice Amount\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),

        // Status Info
        // Invoice status: only the word "Sent" (case-insensitive)
        invoiceStatus: extractValue(section, /Invoice Status\s*(Sent|sent)/),
        partnerStatus: summary.partnerStatus || extractValue(section, /Partner Status\s*([^\n]+)/),
        paymentDue: summary.paymentDue || extractValue(section, /Payment Due\s*([^\n]+)/),

        // Customer Info
        customer: summary.customer || extractValue(section, /Customer\s*([^\n]+)/),
        customerAddress: summary.customerAddress || extractCustomerAddress(section),
        accountNumber: extractValue(section, /Account #\s*([^\n]+)/),
        poNumber: extractValue(section, /PO #\s*([^\n]+)/),

        // Financial Info
        subtotal: parseFloat(extractValue(section, /Sub Total\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        tax: parseFloat(extractValue(section, /Tax\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        shipping: parseFloat(extractValue(section, /Shipping\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        grandTotal: parseFloat(extractValue(section, /Grand Total\s*([^\n]+)/)?.replace(/[,$]/g, '') || '0'),
        mirn: extractValue(section, /MIRN\s*([^\n]+)/),

        // Items
        items: extractInvoiceItems(section),

        // Notes
        notes: summary.notes || ''
      };

      invoices.push(invoice);
    } catch (error) {
      console.error('Error parsing invoice section:', error);
    }
  }

  return invoices;
};

interface SummaryFields {
  invoiceNumber: string;
  invoiceStatus: string;
  partnerStatus: string;
  invoiceDate: string;
  paymentDue: string;
  customer: string;
  customerAddress: string;
  notes: string;
}

// Extract summary table fields from the section text
const extractSummaryFields = (text: string): SummaryFields => {
  // Try to match the summary table block
  // The summary table is usually a block with "Summary", "Customer", "Notes" as headers
  const summaryBlockMatch = text.match(/Summary\s+Customer\s+Notes([\s\S]+?)(?:Order #|#\s+Qty|$)/);
  let summaryBlock = summaryBlockMatch ? summaryBlockMatch[1] : '';

  // Fallback: try to match lines individually if block not found
  const getField = (label: string) => {
    const regex = new RegExp(label + '\\s*:?\\s*([^\n]+)', 'i');
    const match = summaryBlock.match(regex) || text.match(regex);
    return match ? match[1].trim() : '';
  };

  // Extract customer block (may be multiline)
  let customerBlock = '';
  const customerBlockMatch = summaryBlock.match(/Customer\s*([\s\S]+?)Notes/i);
  if (customerBlockMatch) {
    customerBlock = customerBlockMatch[1].replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  } else {
    // Fallback: try to get customer from the text
    const custMatch = text.match(/Customer\s*([\s\S]+?)Notes/i);
    customerBlock = custMatch ? custMatch[1].replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim() : '';
  }

  // Extract notes (may be multiline)
  let notesBlock = '';
  const notesBlockMatch = summaryBlock.match(/Notes\s*([^\n]+)/i) || text.match(/Notes\s*([^\n]+)/i);
  if (notesBlockMatch) {
    notesBlock = notesBlockMatch[1].trim();
  }

  // Try to extract address and phone from customer block
  let customer = '';
  let customerAddress = '';
  if (customerBlock) {
    // The first line is the customer name, the rest is address/phone
    const lines = customerBlock.split(/(?<=\])|(?<=\d{5})|(?<=\d{3}-\d{4})/g).map(l => l.trim()).filter(Boolean);
    customer = lines[0] || '';
    customerAddress = lines.slice(1).join(' ').replace(/\s{2,}/g, ' ').trim();
  }

  // Only match 7-digit invoice number after "Invoice Number" or "Invoice #"
  const invoiceNumberMatch = summaryBlock.match(/Invoice (Number|#)\s*:?[\s-]*([0-9]{7})/);
  const invoiceStatusMatch = summaryBlock.match(/Invoice Status\s*(Sent|sent)/);

  // Partner Status: only the first 1-3 words (letters and spaces)
  let partnerStatus = '';
  const partnerStatusMatch = summaryBlock.match(/Partner Status\s*([A-Za-z ]{3,30})/);
  if (partnerStatusMatch) {
    partnerStatus = partnerStatusMatch[1].trim();
  } else {
    // fallback to previous method
    partnerStatus = getField('Partner Status');
  }

  return {
    invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[2] : '',
    invoiceStatus: invoiceStatusMatch ? invoiceStatusMatch[1] : '',
    partnerStatus,
    invoiceDate: getField('Invoice Date'),
    paymentDue: getField('Payment Due'),
    customer,
    customerAddress,
    notes: notesBlock
  };
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
