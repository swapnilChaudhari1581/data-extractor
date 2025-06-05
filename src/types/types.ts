export interface FileWithPreview {
  file: File;
  preview: string | null;
}

export interface ExtractedData {
  fileName: string;
  fileType: string;
  extractedText: string;
  timestamp: string;
}
