import React, { useState } from 'react';
import styled from 'styled-components';
import { ExtractedData, FileWithPreview } from '../types/types';
import { extractTextFromImage, extractTextFromPDF } from '../utils/extractor';
import LoadingSpinner from './LoadingSpinner';
 

// Styled Components
const ExtractorContainer = styled.div`
  margin: 30px 0;
`;

const ExtractButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProgressContainer = styled.div`
  margin: 20px 0;
  text-align: center;
`;

const ProgressText = styled.div`
  font-size: 1rem;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 auto;
  max-width: 400px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  width: ${props => props.progress}%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
`;

const StatusMessage = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  text-align: center;
  font-size: 0.9rem;
  color: #495057;
`;

// Component Interface
interface DataExtractorProps {
  files: FileWithPreview[];
  onDataExtracted: (data: ExtractedData[]) => void;
  onProcessingChange: (processing: boolean) => void;
}

const DataExtractor: React.FC<DataExtractorProps> = ({ 
  files, 
  onDataExtracted, 
  onProcessingChange 
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');

  const handleExtraction = async () => {
    setIsExtracting(true);
    onProcessingChange(true);
    setProgress(0);
    setCurrentStatus('Starting extraction...');

    const extractedData: ExtractedData[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileWithPreview = files[i];
      const { file } = fileWithPreview;
      
      setCurrentFile(file.name);
      setProgress((i / files.length) * 100);

      try {
        let text = '';
        
        if (file.type === 'application/pdf') {
          setCurrentStatus('📄 Processing PDF...');
          text = await extractTextFromPDF(file);
        } else if (file.type.startsWith('image/')) {
          setCurrentStatus('🔍 Running OCR on image...');
          text = await extractTextFromImage(file);
        } else {
          setCurrentStatus('❌ Unsupported file type');
          text = `❌ Unsupported file type: ${file.type}

Supported formats:
• Images: PNG, JPG, JPEG, GIF, BMP
• Documents: PDF (with conversion guidance)

Please upload a supported file format.`;
        }

        extractedData.push({
          fileName: file.name,
          fileType: file.type,
          extractedText: text,
          timestamp: new Date().toISOString()
        });
        
        setCurrentStatus(`✅ Completed ${file.name}`);
        
      } catch (error) {
        console.error(`Error extracting from ${file.name}:`, error);
        setCurrentStatus(`❌ Error processing ${file.name}`);
        
        extractedData.push({
          fileName: file.name,
          fileType: file.type,
          extractedText: `❌ **Extraction Error**

**File:** ${file.name}
**Type:** ${file.type}
**Error:** ${error || 'Unknown error occurred'}

**Troubleshooting:**
• **For Images:** Try a higher resolution or clearer image
• **For PDFs:** Convert to images first using online tools
• **File Issues:** Check if the file is corrupted or try a different format

**Quick Solutions:**
1. 📸 Take a clearer photo/screenshot
2. 🔄 Convert PDF to JPG using [SmallPDF](https://smallpdf.com/pdf-to-jpg)
3. 📱 Use your phone to scan the document directly

**Need Help?** Try uploading a simple image with clear text first!`,
          timestamp: new Date().toISOString()
        });
      }
    }

    setProgress(100);
    setCurrentStatus('🎉 All files processed!');
    onDataExtracted(extractedData);
    
    // Clean up after 1.5 seconds
    setTimeout(() => {
      setIsExtracting(false);
      onProcessingChange(false);
      setCurrentFile('');
      setCurrentStatus('');
      setProgress(0);
    }, 1500);
  };

  const getFileTypeCount = () => {
    const imageFiles = files.filter(f => f.file.type.startsWith('image/')).length;
    const pdfFiles = files.filter(f => f.file.type === 'application/pdf').length;
    
    let summary = '';
    if (imageFiles > 0) summary += `${imageFiles} image${imageFiles > 1 ? 's' : ''}`;
    if (pdfFiles > 0) {
      if (summary) summary += ', ';
      summary += `${pdfFiles} PDF${pdfFiles > 1 ? 's' : ''}`;
    }
    return summary;
  };

  return (
    <ExtractorContainer>
      {/* File Summary */}
      {files.length > 0 && !isExtracting && (
        <StatusMessage>
          📂 Ready to process: {getFileTypeCount()}
          {files.some(f => f.file.type === 'application/pdf') && (
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#6c757d' }}>
              💡 PDFs will show conversion guidance for best results
            </div>
          )}
        </StatusMessage>
      )}

      {/* Extract Button */}
      <ExtractButton 
        onClick={handleExtraction} 
        disabled={isExtracting || files.length === 0}
      >
        {isExtracting ? (
          <>
            <LoadingSpinner size={20} />
            Processing...
          </>
        ) : (
          <>
            🔍 Extract Data ({files.length} file{files.length !== 1 ? 's' : ''})
          </>
        )}
      </ExtractButton>

      {/* Progress Section */}
      {isExtracting && (
        <ProgressContainer>
          <ProgressText>
            {currentStatus}
          </ProgressText>
          {currentFile && (
            <div style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '10px' }}>
              Current: {currentFile}
            </div>
          )}
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>
          <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '5px' }}>
            {Math.round(progress)}% Complete
          </div>
        </ProgressContainer>
      )}
    </ExtractorContainer>
  );
};

export default DataExtractor;
