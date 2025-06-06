import Tesseract from 'tesseract.js';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Configure PDF.js worker for React (CRA/Vite): use public folder path
GlobalWorkerOptions.workerSrc = (process.env.PUBLIC_URL || '') + '/pdf.worker.min.js';

export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m)
    });
    return text || 'No text detected in this image.';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Image OCR failed: ${errorMessage}`);
  }
};

// Helper function to safely get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
};

// Helper function to check if error message contains specific text
const errorIncludes = (error: unknown, searchText: string): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes(searchText.toLowerCase());
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    debugger
    console.log('Starting PDF-to-image OCR extraction...');

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({
      data: arrayBuffer,
      verbosity: 0
    }).promise;

    console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);

    let fullText = '';
    let extractedPagesCount = 0;

    // Helper to render a PDF page to an image (DataURL)
    const renderPageToImage = async (page: any): Promise<string> => {
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale = better OCR
      // Create a canvas in memory
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      // Convert canvas to DataURL (PNG)
      return canvas.toDataURL('image/png');
    };

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`Rendering and OCR for page ${pageNum}/${pdf.numPages}`);
        const page = await pdf.getPage(pageNum);
        const imageDataUrl = await renderPageToImage(page);

        // Run Tesseract OCR on the image
        const { data: { text: ocrText } } = await Tesseract.recognize(
          imageDataUrl,
          'eng',
          { logger: m => console.log(m) }
        );

        const pageText = ocrText ? ocrText.trim() : '';

        if (pageText.length > 0) {
          fullText += `=== Page ${pageNum} ===\n${pageText}\n\n`;
          extractedPagesCount++;
          console.log(`Page ${pageNum}: OCR extracted ${pageText.length} characters`);
        } else {
          fullText += `=== Page ${pageNum} ===\n[No text detected by OCR]\n\n`;
          console.log(`Page ${pageNum}: No text detected by OCR`);
        }
      } catch (pageError) {
        const pageErrorMessage = getErrorMessage(pageError);
        console.error(`Error processing page ${pageNum}:`, pageErrorMessage);
        fullText += `=== Page ${pageNum} ===\n[Error reading page: ${pageErrorMessage}]\n\n`;
      }
    }

    // Generate results
    if (extractedPagesCount === 0) {
      return `📄 **PDF Processed: ${file.name}**

📊 **File Information:**
• Total Pages: ${pdf.numPages}
• Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
• Pages with Text: 0

⚠️ **No Text Content Found**

**This PDF likely contains:**
• Scanned images instead of text
• Graphics or photos only
• Complex formatting that couldn't be parsed

🔄 **Recommended Solutions:**

**🎯 Option 1: Convert to Images (Best Results)**
1. Go to: https://smallpdf.com/pdf-to-jpg
2. Upload your PDF
3. Download all page images
4. Upload images here for OCR

**📱 Option 2: Take Screenshots**
• Screenshot each PDF page
• Save as PNG/JPG files
• Upload screenshots for text extraction

**🖥️ Option 3: Try Different PDF**
• Use a text-based PDF (created from Word/Google Docs)
• Avoid scanned documents

💡 **Why this happens:** Scanned PDFs are essentially image files. Our OCR works much better on actual image files!`;
    }
    
    return `✅ **PDF OCR Extraction Successful**

    📄 **File:** ${file.name}
    📊 **Total Pages:** ${pdf.numPages}
    📝 **Pages with OCR Text:** ${extractedPagesCount}
    📏 **Characters Extracted:** ${fullText.length}
    ⏰ **Processed:** ${new Date().toLocaleString()}

    📋 **Extracted Content:**
    ${fullText.trim()}

    ---
    💡 **PDF pages were converted to images and processed with OCR for best results.**`;

  } catch (error) {
    console.error('PDF OCR extraction failed:', error);

    const errorMessage = getErrorMessage(error);
    console.log('Error details:', errorMessage);

    // Build detailed error response
    let response = `❌ **PDF OCR Processing Failed**

    📄 **File:** ${file.name}
    📊 **Size:** ${(file.size / 1024 / 1024).toFixed(2)} MB

    `;

    // Check for specific error types and provide solutions
    if (errorIncludes(error, 'invalid') || errorIncludes(error, 'corrupt')) {
      response += `**❌ Issue:** Invalid or corrupted PDF file

    **🔧 Solutions:**
    • Re-download the PDF file
    • Check if file is actually a PDF
    • Try opening in Adobe Reader first
    • Convert to images: https://smallpdf.com/pdf-to-jpg`;

    } else if (errorIncludes(error, 'password')) {
      response += `**🔒 Issue:** Password-protected PDF

    **🔧 Solutions:**
    • Remove password protection first
    • Use Adobe Reader to unlock PDF
    • Save as new unprotected PDF
    • Convert to images: https://smallpdf.com/pdf-to-jpg`;

    } else if (errorIncludes(error, 'fetch') || errorIncludes(error, 'worker')) {
      response += `**🌐 Issue:** PDF.js worker loading problem

    **🔧 Solutions:**
    • Check internet connection
    • Refresh the page and try again
    • Convert PDF to images as alternative
    • Try a different browser`;

    } else if (errorIncludes(error, 'memory') || errorIncludes(error, 'size')) {
      response += `**💾 Issue:** PDF file too large or complex

    **🔧 Solutions:**
    • Try a smaller PDF file
    • Convert PDF to images first
    • Break large PDF into smaller parts
    • Use online compression tools`;

    } else {
      response += `**⚠️ Technical Error:** ${errorMessage}

    **🔧 General Solutions:**
    • Convert to images: https://smallpdf.com/pdf-to-jpg
    • Try a different, simpler PDF file
    • Use screenshots of PDF pages
    • Check if PDF opens in other applications`;
    }

    response += `

    **🚀 Quick Alternative (Always Works):**
    1. Take screenshots of each PDF page
    2. Save as JPG/PNG images
    3. Upload images here for OCR
    4. Get perfect text extraction!

    **💡 Why convert to images?** Our OCR engine works better with image files than complex PDF structures!`;

    throw new Error(response);
  }
};
