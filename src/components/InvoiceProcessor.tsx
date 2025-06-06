
import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { InvoiceData } from '../types/types';
import { extractTextFromImage, extractTextFromPDF } from '../utils/extractor';
import { parseDrawInvoice } from '../utils/parseDrawInvoice';
import {InvoiceTable} from './InvoiceTable';

// Main component
const InvoiceProcessor: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Extract text using your existing function
      const rawText = file.type.includes('pdf') 
        ? await extractTextFromPDF(file)
        : await extractTextFromImage(file);

      // Parse invoice data
      const parsedInvoices = parseDrawInvoice(rawText);
      setInvoices(parsedInvoices);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  const exportToCSV = () => {
    const csvContent = invoices.map(invoice => 
      `${invoice.invoiceNumber},${invoice.invoiceDate},${invoice.grandTotal},${invoice.invoiceStatus}`
    ).join('\n');
    
    const blob = new Blob([`Invoice Number,Date,Amount,Status\n${csvContent}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ferguson_invoices.csv';
    a.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Draw Invoice Processor
      </Typography>

      {/* File Upload */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the file here...' : 'Drag & drop PDF or image file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select file
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Processing invoice...</Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Export Button */}
      {invoices.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
          >
            Export to CSV
          </Button>
        </Box>
      )}

      {/* Invoice Table */}
      {invoices.length > 0 && <InvoiceTable invoices={invoices} />}
    </Box>
  );
};

export default InvoiceProcessor;