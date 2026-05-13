export interface DocumentUploadModel {
  id: number;
  originalName: string;
  bytesSize: number;
  FormatedSize: string;
  dataUpload: string;
}

export interface StagedFile {
  file: File;
  isValid: boolean;
  errorMessage?: string;
}
