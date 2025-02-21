
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { SupplierRevenueChart } from "@/components/dashboard/SupplierRevenueChart";
import { TopItemsTable } from "@/components/dashboard/TopItemsTable";

interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  totalVAT: number;
  averageAmount: number;
  supplierCount: number;
}

interface SupplierData {
  supplier_name: string;
  total_amount: number;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const MIS = () => {
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*');

        if (invoicesError) throw invoicesError;

        if (invoices) {
          const summaryData: InvoiceSummary = {
            totalInvoices: invoices.length,
            totalAmount: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
            totalVAT: invoices.reduce((sum, inv) => sum + (inv.vat_amount || 0), 0),
            averageAmount: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) / invoices.length,
            supplierCount: new Set(invoices.map(inv => inv.supplier_name)).size
          };
          setSummary(summaryData);

          const supplierTotals = invoices.reduce((acc: Record<string, number>, inv) => {
            acc[inv.supplier_name] = (acc[inv.supplier_name] || 0) + (inv.total_amount || 0);
            return acc;
          }, {});

          const supplierChartData = Object.entries(supplierTotals)
            .map(([supplier_name, total_amount]) => ({
              supplier_name,
              total_amount
            }))
            .sort((a, b) => b.total_amount - a.total_amount)
            .slice(0, 5);

          setSupplierData(supplierChartData);
        }

        const { data: items, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .order('quantity', { ascending: false })
          .limit(5);

        if (itemsError) throw itemsError;

        if (items) {
          setLineItems(items);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <SummaryCards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SupplierRevenueChart supplierData={supplierData} />
            <TopItemsTable lineItems={lineItems} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MIS;
