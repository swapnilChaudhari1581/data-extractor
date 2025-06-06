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

  Divider,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { InvoiceData } from '../types/types';

interface InvoiceTableProps {
  invoices: InvoiceData[];
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent': return 'success';
      case 'pending approval': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon />
        Ferguson Facilities Supply Invoices ({invoices.length})
      </Typography>

      {invoices.map((invoice, index) => (
        <Accordion key={`${invoice.invoiceNumber}-${index}`} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Typography variant="h6">
                  Invoice #{invoice.invoiceNumber}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(invoice.invoiceDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant="h6" color="primary">
                  {formatCurrency(invoice.grandTotal)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Chip 
                  label={invoice.invoiceStatus} 
                  color={getStatusColor(invoice.invoiceStatus)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Chip 
                  label={invoice.partnerStatus} 
                  color={getStatusColor(invoice.partnerStatus)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Invoice Details */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Invoice Details</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography><strong>Vendor:</strong> {invoice.vendorName}</Typography>
                      <Typography><strong>Vendor ID:</strong> {invoice.vendorId}</Typography>
                      <Typography><strong>Payment Due:</strong> {formatDate(invoice.paymentDue)}</Typography>
                      <Typography><strong>PO Number:</strong> {invoice.poNumber}</Typography>
                      <Typography><strong>Account:</strong> {invoice.accountNumber}</Typography>
                      <Typography><strong>MIRN:</strong> {invoice.mirn}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Customer Details */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Customer Details</Typography>
                    <Typography><strong>Customer:</strong> {invoice.customer}</Typography>
                    <Typography><strong>Address:</strong> {invoice.customerAddress}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Items Table */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Line Items</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>SKU</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                        <TableCell align="right"><strong>Qty</strong></TableCell>
                        <TableCell align="right"><strong>Price</strong></TableCell>
                        <TableCell align="right"><strong>Extension</strong></TableCell>
                        <TableCell align="center"><strong>Taxable</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.items.map((item, itemIndex) => (
                        <TableRow key={`${item.sku}-${itemIndex}`}>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell align="right">{item.qty}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.ext)}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={item.nontaxable === 'NO' ? 'Yes' : 'No'}
                              color={item.nontaxable === 'NO' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Totals */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Invoice Totals</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Typography><strong>Subtotal:</strong></Typography>
                        <Typography variant="h6">{formatCurrency(invoice.subtotal)}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography><strong>Tax:</strong></Typography>
                        <Typography variant="h6">{formatCurrency(invoice.tax)}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography><strong>Shipping:</strong></Typography>
                        <Typography variant="h6">{formatCurrency(invoice.shipping)}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography><strong>Grand Total:</strong></Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(invoice.grandTotal)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};


