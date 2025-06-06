import React, { useState } from 'react';
import styled from 'styled-components';
import { ExtractedData } from '../types/types';
import InvoiceProcessor from './InvoiceProcessor';
 

const ResultContainer = styled.div`
  margin-top: 30px;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ResultTitle = styled.h2`
  color: #333;
  margin: 0;
`;

const ExportButton = styled.button`
  background: #4ecdc4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: #45b7b8;
  }
`;

const ResultGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const ResultCard = styled.div`
  background: white;
  border: 2px solid #f0f0f0;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const FileName = styled.h3`
  color: #333;
  margin: 0;
  font-size: 1.1rem;
`;

const FileType = styled.span`
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TextContent = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-wrap;
  border: 1px solid #e9ecef;
`;

const CopyButton = styled.button`
  background: #17a2b8;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 10px;
  
  &:hover {
    background: #138496;
  }
`;

const WordCount = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 10px;
`;

interface ResultDisplayProps {
  data: ExtractedData[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ data }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [drawIndex, setDrawIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const exportAllData = () => {
    const allText = data.map(item =>
      `=== ${item.fileName} ===\n${item.extractedText}\n\n`
    ).join('');
    
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-data.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <ResultContainer>
      <ResultHeader>
        <ResultTitle>📋 Extracted Data ({data.length} files)</ResultTitle>
        <ExportButton onClick={exportAllData}>
          💾 Export All
        </ExportButton>
      </ResultHeader>

      <ResultGrid>
        {data.map((item, index) => (
          <ResultCard key={index}>
            <CardHeader>
              <FileName>{item.fileName}</FileName>
              <FileType>{item.fileType.split('/')[1].toUpperCase()}</FileType>
            </CardHeader>
            
            <TextContent>
              {item.extractedText || 'No text found in this file.'}
            </TextContent>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <WordCount>
                Words: {getWordCount(item.extractedText)} |
                Characters: {item.extractedText.length}
              </WordCount>
              
              <CopyButton
                onClick={() => copyToClipboard(item.extractedText, index)}
              >
                {copiedIndex === index ? '✅ Copied!' : '📋 Copy'}
              </CopyButton>
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <ExportButton onClick={() => setDrawIndex(drawIndex === index ? null : index)}>
                {drawIndex === index ? 'Hide Draw' : 'Display Draw'}
              </ExportButton>
            </div>
            {drawIndex === index && (
              <div style={{ marginTop: 16 }}>
                <InvoiceProcessor />
              </div>
            )}
          </ResultCard>
        ))}
      </ResultGrid>
    </ResultContainer>
  );
};

export default ResultDisplay;
