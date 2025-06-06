import React, { useState } from 'react';
import styled from 'styled-components';
 
import './App.css';
import { ExtractedData, FileWithPreview } from './types/types';
 
import DataExtractor from './components/DataExtractor';
import ResultDisplay from './components/ResultDisplay';
import FileUploader from './components/FileUploader';
import InvoiceProcessor from './components/InvoiceProcessor';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
  position: relative;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  margin: 10px 0 0 0;
  font-size: 1.1rem;
  opacity: 0.9;
`;

const ContentArea = styled.div`
  padding: 30px;
`;

const DrawButton = styled.button`
  position: absolute;
  top: 30px;
  right: 30px;
  background: #fff;
  color: #764ba2;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: background 0.2s;
  z-index: 2;
  &:hover {
    background: #f3eaff;
    color: #667eea;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  min-width: 350px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  position: relative;
`;

function App() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDraw, setShowDraw] = useState(false);

  const handleFilesSelected = (selectedFiles: FileWithPreview[]) => {
    setFiles(selectedFiles);
    setExtractedData([]);
  };

  const handleDataExtracted = (data: ExtractedData[]) => {
    setExtractedData(data);
  };

  const handleProcessingChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  return (
    <AppContainer>
      <Container>
        <Header>
          <Title>📄 Data Extractor</Title>
          <Subtitle>Extract text from PDFs and images with ease</Subtitle>
          <DrawButton onClick={() => setShowDraw(true)}>📝 Draw</DrawButton>
        </Header>
        
        <ContentArea>
          <FileUploader
            onFilesSelected={handleFilesSelected}
            isProcessing={isProcessing}
          />
          
          {files.length > 0 && (
            <DataExtractor
              files={files}
              onDataExtracted={handleDataExtracted}
              onProcessingChange={handleProcessingChange}
            />
          )}
          
          {extractedData.length > 0 && (
            <ResultDisplay data={extractedData} />
          )}
        </ContentArea>
        {showDraw && (
          <ModalOverlay onClick={() => setShowDraw(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <button
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  color: '#764ba2',
                  cursor: 'pointer'
                }}
                onClick={() => setShowDraw(false)}
                aria-label="Close"
              >×</button>
              <h2 style={{ marginTop: 0, marginBottom: 18, color: '#764ba2' }}>Draw Invoice</h2>
              <div>
                {/* Render InvoiceProcessor in modal */}
                <React.Suspense fallback={<div>Loading...</div>}>
                  <InvoiceProcessor />
                </React.Suspense>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </AppContainer>
  );
}

export default App;
