
import { useState } from "react";
import FileUpload from "../components/FileUpload";
import DataPreview from "../components/DataPreview";
import QueryInterface from "../components/QueryInterface";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../lib/supabaseClient";

const Index = () => {
  const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const saveToDatabase = async (invoiceData: any) => {
    try {
      console.log("Saving to database:", invoiceData); // Debug log
      
      // First insert the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          supplier_name: invoiceData["Supplier Name"],
          invoice_number: invoiceData["Invoice Number"],
          invoice_date: invoiceData["Invoice Date"],
          total_amount: invoiceData["Total Amount"],
          vat_amount: invoiceData["VAT Amount"] || invoiceData["Tax Amount"],
          due_date: invoiceData["Due Date"],
          payment_terms: invoiceData["Payment Terms"],
          purchase_order_number: invoiceData["Purchase Order Number"]
        })
        .select()
        .single();

      if (invoiceError) {
        console.error("Invoice insert error:", invoiceError); // Debug log
        throw invoiceError;
      }

      console.log("Invoice saved:", invoice); // Debug log

      // Then insert line items with the invoice_id
      if (invoiceData["Line Items"] && invoice) {
        const lineItems = invoiceData["Line Items"].map((item: any) => ({
          invoice_id: invoice.id,
          description: item.description || item.Description || "",
          quantity: item.quantity || item.Quantity || 0,
          unit_price: item.unitPrice || item["Unit Price"] || item.unit_price || 0,
          total: item.total || item.Total || 0
        }));

        console.log("Saving line items:", lineItems); // Debug log

        const { error: lineItemsError } = await supabase
          .from('line_items')
          .insert(lineItems);

        if (lineItemsError) {
          console.error("Line items insert error:", lineItemsError); // Debug log
          throw lineItemsError;
        }
      }

      toast.success("Invoice data saved successfully!");
    } catch (error) {
      console.error("Storage error:", error);
      toast.error("Failed to save invoice data");
      throw error;
    }
  };

  const extractInvoiceData = async (base64Image: string) => {
    const API_KEY = localStorage.getItem('GEMINI_API_KEY');
    
    if (!API_KEY) {
      const userInput = window.prompt("Please enter your Google Gemini API Key:");
      if (!userInput) {
        throw new Error("API key is required");
      }
      localStorage.setItem('GEMINI_API_KEY', userInput);
    }

    const currentApiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!currentApiKey) {
      throw new Error("API key is required");
    }

    try {
      const genAI = new GoogleGenerativeAI(currentApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this invoice image and extract the following information in a JSON format:
      - Supplier Name
      - Invoice Date
      - Invoice Number
      - Total Amount
      - Due Date
      - VAT Amount or Tax Amount (if present)
      - Payment Terms
      - Purchase Order Number
      - Line Items (extract all line items with their descriptions, quantities, unit prices, and total amounts in an array)
      
      For line items, make sure to capture:
      - Full item description (including any notes or specifications)
      - Quantity
      - Unit Price
      - Total Amount
      
      Please ensure the line items array contains objects with consistent field names:
      - "description" for the item description
      - "quantity" for the quantity
      - "unitPrice" for the unit price
      - "total" for the total amount
      
      If there are any tax-related fields (VAT, GST, Sales Tax), include them as well.
      Return ONLY the JSON object with these fields, make sure the Line Items are in an array format. The response should be a valid JSON object.`;

      console.log("Sending image to Gemini API..."); // Debug log

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      console.log("Received response from Gemini:", text); // Debug log
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        const extractedData = JSON.parse(jsonMatch[0]);
        
        console.log("Parsed extracted data:", extractedData); // Debug log
        
        // Save to database
        await saveToDatabase(extractedData);
        
        return extractedData;
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        throw new Error("Failed to parse extracted data");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      if (error instanceof Error && error.message.includes("403")) {
        localStorage.removeItem('GEMINI_API_KEY');
        toast.error("Invalid API key. Please try again with a valid key.");
      }
      throw error;
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsLoading(true);
      const base64 = await getBase64(file);
      const data = await extractInvoiceData(base64);
      setExtractedData(data);
      toast.success("Data extracted and saved successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to extract data from the file");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestion = async (question: string) => {
    try {
      if (!extractedData) {
        toast.error("Please upload an invoice first");
        return;
      }

      const API_KEY = localStorage.getItem('GEMINI_API_KEY');
      if (!API_KEY) {
        throw new Error("API key is required");
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Given this invoice data: ${JSON.stringify(extractedData)}
      
      Answer this question: ${question}
      
      Provide a clear and concise answer based only on the invoice data provided.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnswer(response.text());
    } catch (error) {
      toast.error("Failed to process your question");
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-4"
    >
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            Invoice Data Extraction
          </h1>
          <p className="text-gray-600">
            Upload your invoice to extract data and ask questions
          </p>
        </div>

        <FileUpload onFileSelect={handleFileSelect} />

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Analyzing invoice...</p>
          </div>
        )}

        {extractedData && !isLoading && (
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
