
import { useState } from "react";
import FileUpload from "../components/FileUpload";
import DataPreview from "../components/DataPreview";
import QueryInterface from "../components/QueryInterface";
import { motion } from "framer-motion";
import { toast } from "sonner";

const Index = () => {
  const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);
  const [answer, setAnswer] = useState<string>("");

  const handleFileSelect = async (file: File) => {
    try {
      // TODO: Implement actual data extraction logic
      // This is a mockup for now
      const mockData = {
        "Invoice Number": "INV-2024-001",
        "Date": "2024-01-20",
        "Amount": "$1,234.56",
        "Vendor": "Example Corp",
      };
      
      toast.success("Data extracted successfully!");
      setExtractedData(mockData);
    } catch (error) {
      toast.error("Failed to extract data from the file");
      console.error(error);
    }
  };

  const handleQuestion = async (question: string) => {
    try {
      // TODO: Implement actual Q&A logic
      setAnswer(`This is a mock answer to your question: "${question}"`);
    } catch (error) {
      toast.error("Failed to process your question");
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            Invoice Data Extraction
          </h1>
          <p className="text-gray-600">
            Upload your invoice to extract data and ask questions
          </p>
        </div>

        <FileUpload onFileSelect={handleFileSelect} />

        {extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <DataPreview data={extractedData} />
            <QueryInterface onAskQuestion={handleQuestion} answer={answer} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Index;
