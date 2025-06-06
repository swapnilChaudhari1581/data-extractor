export interface FileWithPreview {
  file: File;
  preview: string | null;
}

export interface ExtractedData {
  fileName: string;
  fileType: string;
  extractedText: string;
  timestamp: string;
}

export interface InvoiceItem {
  qty: number;
  sku: string;
  description: string;
  price: number;
  ext: number;
  nontaxable: string;
}

export interface InvoiceData {
  vendorId: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: number;
  invoiceStatus: string;
  partnerStatus: string;
  paymentDue: string;
  customer: string;
  customerAddress: string;
  accountNumber: string;
  poNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  mirn: string;
  notes: string; // Added to support extraction of Notes column from summary table
}