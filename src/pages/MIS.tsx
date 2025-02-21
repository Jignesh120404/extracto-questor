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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import QueryInterface from "@/components/QueryInterface";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [queryAnswer, setQueryAnswer] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

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

        // Fetch line items data
        const { data: items, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .order('quantity', { ascending: false });

        if (itemsError) throw itemsError;

        if (items) {
          setLineItems(items);
          setFilteredItems(items);
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

  // Filter items based on search query
  useEffect(() => {
    const filtered = lineItems.filter(item =>
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery, lineItems]);

  const handleQuestion = async (question: string) => {
    try {
      // Get all relevant data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          line_items (*)
        `);

      if (invoicesError) throw invoicesError;

      // Process the question and generate an answer based on the data
      let answer = "I'll help you analyze the data. ";

      // Parse the question and provide relevant information
      const lowerQuestion = question.toLowerCase();

      if (lowerQuestion.includes("total amount")) {
        const total = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
        answer += `The total amount across all invoices is $${total.toFixed(2)}.`;
      } else if (lowerQuestion.includes("supplier")) {
        if (lowerQuestion.includes("highest") || lowerQuestion.includes("top")) {
          const supplierTotals = invoices.reduce((acc: Record<string, number>, inv) => {
            acc[inv.supplier_name] = (acc[inv.supplier_name] || 0) + (inv.total_amount || 0);
            return acc;
          }, {});
          const topSupplier = Object.entries(supplierTotals)
            .sort(([, a], [, b]) => b - a)[0];
          answer += `The supplier with the highest total amount is ${topSupplier[0]} with $${topSupplier[1].toFixed(2)}.`;
        } else {
          const uniqueSuppliers = new Set(invoices.map(inv => inv.supplier_name));
          answer += `There are ${uniqueSuppliers.size} unique suppliers in the database.`;
        }
      } else if (lowerQuestion.includes("average")) {
        if (lowerQuestion.includes("invoice")) {
          const avg = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) / invoices.length;
          answer += `The average invoice amount is $${avg.toFixed(2)}.`;
        }
      } else if (lowerQuestion.includes("vat") || lowerQuestion.includes("tax")) {
        const totalVAT = invoices.reduce((sum, inv) => sum + (inv.vat_amount || 0), 0);
        answer += `The total VAT/tax amount across all invoices is $${totalVAT.toFixed(2)}.`;
      } else if (lowerQuestion.includes("recent") || lowerQuestion.includes("latest")) {
        const sortedInvoices = [...invoices].sort((a, b) => 
          new Date(b.invoice_date || 0).getTime() - new Date(a.invoice_date || 0).getTime()
        );
        const latest = sortedInvoices[0];
        answer += `The most recent invoice is from ${latest.supplier_name} dated ${latest.invoice_date} with amount $${latest.total_amount?.toFixed(2)}.`;
      } else {
        answer = "I can help you with information about total amounts, suppliers, averages, VAT/tax amounts, and recent invoices. Please ask a specific question about these topics.";
      }

      setQueryAnswer(answer);
    } catch (error) {
      console.error('Error processing question:', error);
      toast.error('Failed to process your question');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-4"
    >
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Invoice Management Dashboard</h1>
        
        {/* Question Answering System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ask Questions About Your Invoice Data</CardTitle>
            <CardDescription>
              Ask questions about totals, suppliers, averages, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QueryInterface 
              onAskQuestion={handleQuestion}
              answer={queryAnswer}
            />
          </CardContent>
        </Card>

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

        {/* Top Items Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Items by Quantity</CardTitle>
            <CardDescription>View and search through items sorted by quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search by description..."
                    className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                </select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price?.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.total?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {pageNumbers.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default MIS;
