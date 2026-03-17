export interface Attachment {
  fileName: string;
  fileSize: number;
  id: number;
  fileType: string;
  src?: string;
  hasThumbnail?: boolean;
}
