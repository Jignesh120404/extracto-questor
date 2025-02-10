
import { motion } from "framer-motion";

interface DataPreviewProps {
  data: Record<string, string>;
}

const DataPreview = ({ data }: DataPreviewProps) => {
  // Group the fields into categories
  const primaryFields = ["Supplier Name", "Invoice Number", "Invoice Date", "Total Amount"];
  const secondaryFields = Object.keys(data).filter(key => !primaryFields.includes(key));

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
      </div>
    </motion.div>
  );
};

export default DataPreview;
