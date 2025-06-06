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
            <Box sx={{ width: '100%' }}>
              <TableContainer>
                <Table size="small" sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 'none', pl: 0 }}>Vendor ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, border: 'none' }}>Vendor Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, border: 'none' }}>Invoice Number</TableCell>
                      <TableCell sx={{ fontWeight: 600, border: 'none' }}>Invoice Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, border: 'none' }}>Invoice Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ border: 'none', pl: 0 }}>{invoice.vendorId}</TableCell>
                      <TableCell sx={{ border: 'none' }}>{invoice.vendorName}</TableCell>
                      <TableCell sx={{ border: 'none' }}>{invoice.invoiceNumber}</TableCell>
                      <TableCell sx={{ border: 'none' }}>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell sx={{ border: 'none' }}>{formatCurrency(invoice.grandTotal)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Removed duplicate Invoice and Customer Details cards */}

              {/* Summary and Customer Info Table */}
              <Box sx={{ mb: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                      {/* Summary Table */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Summary</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell><strong>Invoice #</strong></TableCell>
                                <TableCell>{invoice.invoiceNumber}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Invoice Status</strong></TableCell>
                                <TableCell>{invoice.invoiceStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Partner Status</strong></TableCell>
                                <TableCell>{invoice.partnerStatus}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Invoice Date</strong></TableCell>
                                <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Service Date</strong></TableCell>
                                <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Payment Due</strong></TableCell>
                                <TableCell>{formatDate(invoice.paymentDue)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                      {/* Customer Table */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Customer</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell>{invoice.customer}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell><strong>Address</strong></TableCell>
                                <TableCell>
                                  {invoice.customerAddress && invoice.customerAddress.split(/,|\n/).map((line, idx) => (
                                    <span key={idx}>
                                      {line.trim()}
                                      <br />
                                    </span>
                                  ))}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
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
