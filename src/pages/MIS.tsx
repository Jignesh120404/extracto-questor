
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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

const MIS = () => {
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [supplierData, setSupplierData] = useState<SupplierData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch summary data
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

          // Calculate supplier-wise totals
          const supplierTotals = invoices.reduce((acc: Record<string, number>, inv) => {
            acc[inv.supplier_name] = (acc[inv.supplier_name] || 0) + (inv.total_amount || 0);
            return acc;
          }, {});

          const supplierChartData = Object.entries(supplierTotals).map(([supplier_name, total_amount]) => ({
            supplier_name,
            total_amount
          }));

          setSupplierData(supplierChartData);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-4"
    >
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Invoice Management Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Invoices</CardTitle>
              <CardDescription>Number of processed invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary?.totalInvoices}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Amount</CardTitle>
              <CardDescription>Sum of all invoice amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${summary?.totalAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total VAT</CardTitle>
              <CardDescription>Sum of all VAT amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${summary?.totalVAT.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Invoice Amount</CardTitle>
              <CardDescription>Average amount per invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${summary?.averageAmount.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unique Suppliers</CardTitle>
              <CardDescription>Number of different suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary?.supplierCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Supplier-wise Total Amount</CardTitle>
            <CardDescription>Distribution of invoice amounts by supplier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="supplier_name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_amount" fill="#3b82f6" name="Total Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default MIS;
