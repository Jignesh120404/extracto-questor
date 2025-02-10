
import { motion } from "framer-motion";

interface DataPreviewProps {
  data: Record<string, string>;
}

const DataPreview = ({ data }: DataPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Extracted Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium text-gray-500">{key}</label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded-md">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DataPreview;
