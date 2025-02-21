
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
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

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  +2.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summary?.totalAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summary?.averageAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  -4.5% from last month
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.supplierCount}</div>
                <p className="text-xs text-muted-foreground">
                  +1 new this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Supplier</CardTitle>
                <CardDescription>Top 5 suppliers by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={supplierData}
                        dataKey="total_amount"
                        nameKey="supplier_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {supplierData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Items by Quantity</CardTitle>
                <CardDescription>Highest quantity items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.total?.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MIS;
