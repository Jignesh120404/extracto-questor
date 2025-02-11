
interface InvoiceData {
  id?: number;
  supplier_name: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  vat_amount?: number;
  due_date?: string;
  payment_terms?: string;
  purchase_order_number?: string;
  line_items?: Array<{
    description: string;
    quantity?: number;
    unit_price?: number;
    total?: number;
  }>;
}

class LocalStorageDB {
  private getInvoices(): InvoiceData[] {
    const invoices = localStorage.getItem('invoices');
    return invoices ? JSON.parse(invoices) : [];
  }

  private saveInvoices(invoices: InvoiceData[]): void {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }

  async insert(table: string, data: InvoiceData) {
    if (table === 'invoices') {
      const invoices = this.getInvoices();
      const newInvoice = {
        ...data,
        id: Date.now(), // Simple way to generate unique IDs
      };
      invoices.push(newInvoice);
      this.saveInvoices(invoices);
      return { data: newInvoice, error: null };
    }
    return { data: null, error: 'Invalid table' };
  }

  async select(table: string) {
    if (table === 'invoices') {
      return { data: this.getInvoices(), error: null };
    }
    return { data: null, error: 'Invalid table' };
  }
}

export const localDB = new LocalStorageDB();

