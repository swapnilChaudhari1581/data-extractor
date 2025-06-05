import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { FileWithPreview } from '../types/types';

const DropzoneContainer = styled.div<{ isDragActive: boolean; isDragReject: boolean }>`
  border: 3px dashed ${props => 
    props.isDragReject ? '#ff6b6b' : 
    props.isDragActive ? '#4ecdc4' : '#ddd'
  };
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  background: ${props => 
    props.isDragReject ? '#ffe0e0' : 
    props.isDragActive ? '#e0f9f7' : '#fafafa'
  };
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;

  &:hover {
    border-color: #4ecdc4;
    background: #f0f9ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const UploadText = styled.div`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 10px;
`;

const UploadSubtext = styled.div`
  font-size: 0.9rem;
  color: #999;
`;

const FilePreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const FilePreview = styled.div`
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
  position: relative;
`;

const FileImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const FileIcon = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 3rem;
`;

const FileName = styled.div`
  font-size: 0.9rem;
  color: #333;
  word-break: break-word;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #ff5252;
  }
`;
// Add this after your existing styled components in FileUploader.tsx:

const InfoBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  text-align: left;
`;

const InfoTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.2rem;
`;

const InfoList = styled.ul`
  margin: 10px 0;
  padding-left: 20px;
`;

const InfoItem = styled.li`
  margin: 8px 0;
  line-height: 1.4;
`;

// Add this component before your return statement in FileUploader:
const InfoSection = () => (
  <InfoBox>
    <InfoTitle>🚀 How to Extract Text Perfectly</InfoTitle>
    
    <div>
      <strong>📸 For Images (Best Results):</strong>
      <InfoList>
        <InfoItem>PNG, JPG, JPEG, GIF, BMP supported</InfoItem>
        <InfoItem>High resolution images work better</InfoItem>
        <InfoItem>Clear, well-lit photos recommended</InfoItem>
      </InfoList>
    </div>
    
    <div style={{ marginTop: '15px' }}>
      <strong>📄 For PDFs:</strong>
      <InfoList>
        <InfoItem>Convert to images first for best results</InfoItem>
        <InfoItem>Use online converters (SmallPDF, ILovePDF)</InfoItem>
        <InfoItem>Then upload the converted images here</InfoItem>
      </InfoList>
    </div>
    
    <div style={{ marginTop: '15px', fontSize: '0.9rem', opacity: '0.9' }}>
      💡 <strong>Pro Tip:</strong> For scanned documents, converting PDF → Images → OCR gives the most accurate results!
    </div>
  </InfoBox>
);

 


interface FileUploaderProps {
  onFilesSelected: (files: FileWithPreview[]) => void;
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isProcessing }) => {
  const [files, setFiles] = React.useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map(file => {
      const fileWithPreview: FileWithPreview = {
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      };
      return fileWithPreview;
    });
    
    const newFiles = [...files, ...filesWithPreview];
    setFiles(newFiles);
    onFilesSelected(newFiles);
  }, [files, onFilesSelected]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/pdf': ['.pdf']
    },
    disabled: isProcessing
  });

  return (
    <div>
      <InfoSection />
      <DropzoneContainer 
        {...getRootProps()} 
        isDragActive={isDragActive} 
        isDragReject={isDragReject}
      >
        <input {...getInputProps()} />
        <UploadIcon>📎</UploadIcon>
        <UploadText>
          {isDragActive
            ? "Drop the files here..."
            : "Drag & drop files here, or click to select"}
        </UploadText>
        <UploadSubtext>
          Supports: PDF, PNG, JPG, JPEG, GIF, BMP
        </UploadSubtext>
      </DropzoneContainer>

      {files.length > 0 && (
        <FilePreviewContainer>
          {files.map((fileWithPreview, index) => (
            <FilePreview key={index}>
              <RemoveButton onClick={() => removeFile(index)}>×</RemoveButton>
              {fileWithPreview.preview ? (
                <FileImage src={fileWithPreview.preview} alt={fileWithPreview.file.name} />
              ) : (
                <FileIcon>📄</FileIcon>
              )}
              <FileName>{fileWithPreview.file.name}</FileName>
            </FilePreview>
          ))}
        </FilePreviewContainer>
      )}
    </div>
  );
};

export default FileUploader;
