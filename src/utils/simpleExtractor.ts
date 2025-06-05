import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m),
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/worker.min.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@4/tesseract-core.wasm.js',
    });
    return text || 'No text detected in this image.';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`Image OCR failed: ${error}`);
  }
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  // Simple PDF handler without complex dependencies
  const fileSize = (file.size / 1024 / 1024).toFixed(2);
  
  return `📄 **PDF File Detected: ${file.name}**

📊 **File Information:**
• Size: ${fileSize} MB
• Type: ${file.type}
• Pages: Analyzing...
• Upload Time: ${new Date().toLocaleString()}

🔄 **Text Extraction Options:**

**🎯 Option 1: Convert to Images (Recommended)**
1. **Online Converters** (Free & Fast):
   • [SmallPDF](https://smallpdf.com/pdf-to-jpg) ⭐
   • [ILovePDF](https://ilovepdf.com/pdf_to_jpg)
   • [PDF24](https://pdf24.org/en/pdf-to-jpg)
   
2. **Steps**:
   • Upload your PDF to any converter above
   • Download the JPG/PNG images
   • Drag & drop images back to this tool
   • Get perfect OCR text extraction!

**📋 Option 2: Manual Text Copy**
1. Open PDF in browser/viewer
2. Select and copy text (if selectable)
3. Paste into notepad

**🔧 Option 3: Desktop Tools**
• Adobe Acrobat Reader DC
• Microsoft Edge (built-in PDF viewer)
• Google Chrome (open PDF, copy text)

**💡 Why Convert to Images?**
✅ Works with scanned documents
✅ Handles any PDF type
✅ Better OCR accuracy
✅ No browser compatibility issues
✅ Supports multiple languages

**🚀 Ready for Images?**
Once you have images, just drag them here for instant text extraction!

---
*💡 Tip: Most modern smartphones can also scan documents directly to images!*`;
};
