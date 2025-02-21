
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";

interface SupplierData {
  supplier_name: string;
  total_amount: number;
}

interface SupplierRevenueChartProps {
  supplierData: SupplierData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const SupplierRevenueChart = ({ supplierData }: SupplierRevenueChartProps) => {
  return (
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
  );
};
