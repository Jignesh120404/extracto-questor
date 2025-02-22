
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./supabaseClient";

export async function extractInvoiceData(file: File) {
  try {
    // Get the Gemini API key from Supabase
    const { data, error: secretError } = await supabase
      .rpc('get_secret', { secret_name: 'GEMINI_API_KEY' } as { secret_name: string });

    if (secretError || !data) {
      throw new Error('Failed to get Gemini API key');
    }

    const GEMINI_API_KEY = data;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Prepare the prompt
    const prompt = `Extract the following information from this invoice image:
    - Invoice number
    - Supplier name
    - Total amount
    - VAT amount
    - Invoice date
    - Due date
    - Payment terms
    - Purchase order number

    Return the information in a JSON format with these exact keys:
    {
      "invoice_number": "",
      "supplier_name": "",
      "total_amount": 0,
      "vat_amount": 0,
      "invoice_date": "YYYY-MM-DD",
      "due_date": "YYYY-MM-DD",
      "payment_terms": "",
      "purchase_order_number": ""
    }`;

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const extractedData = JSON.parse(text);
    return extractedData;
  } catch (error) {
    console.error('Error extracting invoice data:', error);
    throw error;
  }
}
