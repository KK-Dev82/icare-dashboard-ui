export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
  };
  message?: string;
}
