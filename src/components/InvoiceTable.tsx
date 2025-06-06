import React from 'react';
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
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
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

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2, 
              width: '100%',
              alignItems: { xs: 'flex-start', sm: 'center' }
            }}>
              <Typography variant="h6" sx={{ minWidth: 150 }}>
                Invoice #{invoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                {formatDate(invoice.invoiceDate)}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ minWidth: 120 }}>
                {formatCurrency(invoice.grandTotal)}
              </Typography>
              <Chip 
                label={invoice.invoiceStatus} 
                color={getStatusColor(invoice.invoiceStatus)}
                size="small"
              />
              <Chip 
                label={invoice.partnerStatus} 
                color={getStatusColor(invoice.partnerStatus)}
                size="small"
                variant="outlined"
              />
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Invoice and Customer Details */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: 3 
              }}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Invoice Details</Typography>
                    <Stack spacing={1}>
                      <Typography><strong>Vendor:</strong> {invoice.vendorName}</Typography>
                      <Typography><strong>Vendor ID:</strong> {invoice.vendorId}</Typography>
                      <Typography><strong>Payment Due:</strong> {formatDate(invoice.paymentDue)}</Typography>
                      <Typography><strong>PO Number:</strong> {invoice.poNumber}</Typography>
                      <Typography><strong>Account:</strong> {invoice.accountNumber}</Typography>
                      <Typography><strong>MIRN:</strong> {invoice.mirn}</Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Customer Details</Typography>
                    <Typography><strong>Customer:</strong> {invoice.customer}</Typography>
                    <Typography><strong>Address:</strong> {invoice.customerAddress}</Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Items Table */}
              <Box>
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
              </Box>

              {/* Totals */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Invoice Totals</Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2 
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography><strong>Subtotal:</strong></Typography>
                      <Typography variant="h6">{formatCurrency(invoice.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography><strong>Tax:</strong></Typography>
                      <Typography variant="h6">{formatCurrency(invoice.tax)}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography><strong>Shipping:</strong></Typography>
                      <Typography variant="h6">{formatCurrency(invoice.shipping)}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography><strong>Grand Total:</strong></Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(invoice.grandTotal)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
