import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Receipt, Download, Plus, Trash2, Calculator, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSlot from "@/components/AdSlot";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
}

export default function InvoiceGenerator() {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    items: [{ id: '1', description: '', quantity: 1, price: 0 }],
    taxRate: 0,
    notes: ''
  });

  useEffect(() => {
    document.title = "Invoice Generator - ToolSuite Pro | Create Professional Invoices";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional invoice generator to create, customize and download business invoices. Generate PDF invoices with tax calculations, item listings, and professional formatting.');
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Invoice Generator",
      "description": "Professional invoice generator tool",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    if (invoice.items.length > 1) {
      setInvoice(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateSubtotal = () => {
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * invoice.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generateInvoiceHTML = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = calculateTotal();

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .company-info h1 { color: #2563eb; margin: 0 0 10px 0; }
        .invoice-details { text-align: right; }
        .invoice-details h2 { color: #2563eb; margin: 0; }
        .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .billing-section h3 { color: #374151; margin: 0 0 10px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .total-row { font-weight: bold; font-size: 1.1em; border-top: 2px solid #374151; padding-top: 10px; }
        .notes { margin-top: 30px; }
        .notes h3 { color: #374151; }
    </style>
</head>
<body>
    <div class="invoice-header">
        <div class="company-info">
            <h1>${invoice.companyName || 'Your Company'}</h1>
            <p>${invoice.companyAddress.replace(/\n/g, '<br>')}</p>
            <p>Email: ${invoice.companyEmail}</p>
            <p>Phone: ${invoice.companyPhone}</p>
        </div>
        <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
    </div>

    <div class="billing-info">
        <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${invoice.clientName}</strong></p>
            <p>${invoice.clientAddress.replace(/\n/g, '<br>')}</p>
            <p>${invoice.clientEmail}</p>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map(item => `
                <tr>
                    <td>${item.description}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">$${item.price.toFixed(2)}</td>
                    <td class="text-right">$${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        ${invoice.taxRate > 0 ? `
        <div class="totals-row">
            <span>Tax (${invoice.taxRate}%):</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="totals-row total-row">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    </div>

    ${invoice.notes ? `
    <div class="notes">
        <h3>Notes:</h3>
        <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
    </div>
    ` : ''}
</body>
</html>`;
  };

  const downloadInvoice = () => {
    const html = generateInvoiceHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Invoice Downloaded!",
      description: "Your invoice has been downloaded as an HTML file.",
    });
  };

  const printInvoice = () => {
    const html = generateInvoiceHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const clearForm = () => {
    setInvoice({
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      clientName: '',
      clientAddress: '',
      clientEmail: '',
      items: [{ id: '1', description: '', quantity: 1, price: 0 }],
      taxRate: 0,
      notes: ''
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="gradient-bg p-3 rounded-lg mr-4">
              <Receipt className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Invoice Generator</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create professional invoices with automatic calculations, custom branding, and instant download. 
            Perfect for freelancers and small businesses.
          </p>
        </div>

        {/* Ad Slot */}
        <AdSlot position="invoice-generator-top" size="banner" />

        <div className="space-y-8">
          {/* Invoice Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={invoice.companyName}
                    onChange={(e) => setInvoice(prev => ({...prev, companyName: e.target.value}))}
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="company-address">Address</Label>
                  <Textarea
                    id="company-address"
                    value={invoice.companyAddress}
                    onChange={(e) => setInvoice(prev => ({...prev, companyAddress: e.target.value}))}
                    placeholder="123 Main St&#10;City, State 12345"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={invoice.companyEmail}
                      onChange={(e) => setInvoice(prev => ({...prev, companyEmail: e.target.value}))}
                      placeholder="company@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input
                      id="company-phone"
                      value={invoice.companyPhone}
                      onChange={(e) => setInvoice(prev => ({...prev, companyPhone: e.target.value}))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice(prev => ({...prev, invoiceNumber: e.target.value}))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoice.date}
                      onChange={(e) => setInvoice(prev => ({...prev, date: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => setInvoice(prev => ({...prev, dueDate: e.target.value}))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={invoice.taxRate}
                    onChange={(e) => setInvoice(prev => ({...prev, taxRate: parseFloat(e.target.value) || 0}))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={invoice.clientName}
                    onChange={(e) => setInvoice(prev => ({...prev, clientName: e.target.value}))}
                    placeholder="Client Name"
                  />
                </div>
                <div>
                  <Label htmlFor="client-email">Client Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={invoice.clientEmail}
                    onChange={(e) => setInvoice(prev => ({...prev, clientEmail: e.target.value}))}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="client-address">Client Address</Label>
                  <Textarea
                    id="client-address"
                    value={invoice.clientAddress}
                    onChange={(e) => setInvoice(prev => ({...prev, clientAddress: e.target.value}))}
                    placeholder="Client Address"
                    rows={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Items
                <Button onClick={addItem} size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Total</Label>
                      <div className="h-10 flex items-center font-mono font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={invoice.items.length === 1}
                        className="w-full"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2" size={20} />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md ml-auto space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">${calculateSubtotal().toFixed(2)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span className="font-mono">${calculateTax().toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="font-mono">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={invoice.notes}
                onChange={(e) => setInvoice(prev => ({...prev, notes: e.target.value}))}
                placeholder="Additional notes or payment terms..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={downloadInvoice} className="gradient-bg">
              <Download size={16} className="mr-2" />
              Download Invoice
            </Button>
            <Button onClick={printInvoice} variant="outline">
              <Printer size={16} className="mr-2" />
              Print Invoice
            </Button>
            <Button onClick={clearForm} variant="outline">
              Clear Form
            </Button>
          </div>
        </div>

        {/* Ad Slot */}
        <div className="mt-8">
          <AdSlot position="invoice-generator-bottom" size="banner" />
        </div>
      </div>
    </div>
  );
}