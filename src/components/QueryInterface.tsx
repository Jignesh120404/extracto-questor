
import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface QueryInterfaceProps {
  onAskQuestion: (question: string) => void;
  answer?: string;
}

const QueryInterface = ({ onAskQuestion, answer }: QueryInterfaceProps) => {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAskQuestion(question);
      setQuestion("");
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your invoice data..."
          className="w-full px-4 py-3 pr-12 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 rounded-lg"
        >
          <p className="text-gray-700">{answer}</p>
        </motion.div>
      )}
    </div>
  );
};

export default QueryInterface;
