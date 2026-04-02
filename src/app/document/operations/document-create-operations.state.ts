import { DocumentType, SupportedMimeType } from 'src/app/shared/generated';

export interface DocumentCreateOperationsState {
  availableDocumentTypes: DocumentType[];
  availableMimeTypes: SupportedMimeType[];
  pendingAttachmentUploads: number;
  successfulAttachmentIds: string[];
  failedAttachmentIds: string[];
}
