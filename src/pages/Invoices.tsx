import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import FileUpload from "../components/FileUpload";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { extractInvoiceData } from "../lib/extractInvoiceData";
import { Loader2 } from "lucide-react";

interface Invoice {
  id: string;
  invoice_number: string;
  supplier_name: string;
  total_amount: number;
  vat_amount: number;
  invoice_date: string;
  due_date: string;
  payment_terms: string;
  purchase_order_number: string;
  created_at: string;
}

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFileSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      console.log('Processing file:', file.name);
      
      const extractedData = await extractInvoiceData(file);
      console.log('Extracted data:', extractedData);

      const { error: insertError } = await supabase
        .from('invoices')
        .insert([extractedData]);

      if (insertError) {
        console.error('Error inserting invoice:', insertError);
        throw insertError;
      }

      await fetchInvoices();
      toast.success('Invoice processed successfully');
    } catch (error) {
      console.error('Error processing invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/mis')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">Invoice Management</h1>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-lg font-semibold mb-4">Upload New Invoice</h2>
              <div className="relative">
                <FileUpload onFileSelect={handleFileSelect} />
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing invoice...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-lg bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Invoice History</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">VAT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.supplier_name}</TableCell>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        ${invoice.total_amount?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${invoice.vat_amount?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Invoices;
