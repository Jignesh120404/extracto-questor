
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "./supabaseClient";

export async function extractInvoiceData(file: File) {
  try {
    console.log('Starting invoice data extraction...');
    
    // Get the Gemini API key from Supabase
    const { data: apiKey, error: secretError } = await supabase
      .rpc('get_secret', { secret_name: 'GEMINI_API_KEY' });

    if (secretError) {
      console.error('Error fetching Gemini API key:', secretError);
      throw new Error('Failed to get Gemini API key');
    }

    if (!apiKey) {
      console.error('No Gemini API key found');
      throw new Error('Gemini API key not found in secrets');
    }

    // Initialize Gemini
    console.log('Initializing Gemini model...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Convert file to base64
    console.log('Converting file to base64...');
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(new Error('Failed to read file'));
      };
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
    console.log('Sending request to Gemini API...');
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
    
    console.log('Parsing extracted data...');
    // Parse the JSON response
    try {
      const extractedData = JSON.parse(text);
      console.log('Successfully extracted invoice data:', extractedData);
      return extractedData;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      throw new Error('Failed to parse invoice data from Gemini response');
    }
  } catch (error) {
    console.error('Error in invoice data extraction:', error);
    throw error;
  }
}
