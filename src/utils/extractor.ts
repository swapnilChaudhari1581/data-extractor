import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to use local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';

export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m)
    });
    return text;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      verbosity: 0, // Reduce console logs
    }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => {
            // Handle different item types
            if (typeof item === 'object' && item.str) {
              return item.str;
            }
            return '';
          })
          .filter((text: { trim: () => { (): any; new(): any; length: number; }; }) => text.trim().length > 0)
          .join(' ');
        
        if (pageText.trim()) {
          fullText += `Page ${i}:\n${pageText}\n\n`;
        }
      } catch (pageError) {
        console.warn(`Error processing page ${i}:`, pageError);
        fullText += `Page ${i}: [Error reading page]\n\n`;
      }
    }
    
    return fullText.trim() || 'No text content found in PDF';
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`PDF processing failed: ${error}`);
  }
};
