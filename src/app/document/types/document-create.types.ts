import { AttachmentCreateUpdate } from 'src/app/shared/generated';

export type AttachmentFile = {
  fileName: string;
  attachmentId?: string;
  file: File;
};

export type AttachmentData = AttachmentCreateUpdate & {
  fileData: File;
  isValid?: boolean;
};

export interface DocumentAttachmentFormValue {
  id: string | null;
  name: string | null;
  description: string | null;
  fileName: string | null;
  type: string | null;
  size: number | null;
  sizeUnit: string | null;
  mimeTypeName: string | null;
  storageUploadStatus: boolean;
}
