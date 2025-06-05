import React, { useState } from 'react';
import styled from 'styled-components';
 
import './App.css';
import { ExtractedData, FileWithPreview } from './types/types';
 
import DataExtractor from './components/DataExtractor';
import ResultDisplay from './components/ResultDisplay';
import FileUploader from './components/FileUploader';

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

function App() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      </Container>
    </AppContainer>
  );
}

export default App;
