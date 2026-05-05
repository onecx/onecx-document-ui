import { DocumentType } from 'src/app/shared/generated';

export interface DocumentCreateOperationsState {
  availableDocumentTypes: DocumentType[];
  availableMimeTypes: string[];
  pendingAttachmentUploads: number;
  successfulAttachmentIds: string[];
  failedAttachmentIds: string[];
}
