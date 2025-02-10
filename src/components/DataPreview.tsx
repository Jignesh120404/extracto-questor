
import { motion } from "framer-motion";

interface LineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
}

interface DataPreviewProps {
  data: Record<string, any>;
}

const DataPreview = ({ data }: DataPreviewProps) => {
  const primaryFields = ["Supplier Name", "Invoice Number", "Invoice Date", "Total Amount"];
  const secondaryFields = Object.keys(data).filter(
    key => !primaryFields.includes(key) && key !== "Line Items"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryFields.map((key) => (
              data[key] && (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">{key}</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded-md">{data[key]}</p>
                </div>
              )
            ))}
          </div>
        </div>

        {secondaryFields.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secondaryFields.map((key) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-gray-500">{key}</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded-md">{data[key]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data["Line Items"] && data["Line Items"].length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data["Line Items"].map((item: LineItem, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.unitPrice ? `$${item.unitPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.total ? `$${item.total.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DataPreview;
