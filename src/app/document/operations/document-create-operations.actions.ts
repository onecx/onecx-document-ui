import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  DocumentCreateUpdate,
  DocumentDetail,
  DocumentType,
  SupportedMimeType,
  UploadAttachmentPresignedUrlRequest,
} from 'src/app/shared/generated';
import { AttachmentFile } from '../types/document-create.types';

export const DocumentCreateOperationsActions = createActionGroup({
  source: 'DocumentCreateOperationsActions',
  events: {
    'start document creation': props<{
      docRequest: DocumentCreateUpdate;
      files: AttachmentFile[];
    }>(),
    'document creation failed': emptyProps(),
    'document created succesfully': props<{
      createdDocument: DocumentDetail;
      files: AttachmentFile[];
    }>(),
    'request document upload urls': props<{
      createdDocument: DocumentDetail;
      uploadRequests: UploadAttachmentPresignedUrlRequest[];
      files: AttachmentFile[];
    }>(),
    'upload attachment': props<{
      presignedUrl: string;
      file: File;
      documentId: string;
      attachmentId: string;
    }>(),
    'upload attachment success': props<{
      documentId: string;
      attachmentId: string;
    }>(),
    'ensure reference data loaded': emptyProps(),
    'load reference data failed': props<{ error: string | null }>(),
    'available document types received': props<{ types: DocumentType[] }>(),
    'available mime types received': props<{
      mimeTypes: SupportedMimeType[];
    }>(),
    'attachment upload failed': props<{
      documentId: string;
      attachmentId: string;
    }>(),
    'all attachments uploaded': props<{
      documentId: string;
      successfulIds: string[];
      failedIds: string[];
    }>(),
    'document creation completed': emptyProps(),
    'document creation final step failed': emptyProps(),
  },
});
