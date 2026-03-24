import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  AttachmentPresignedUrlResponse,
  DocumentCreateUpdate,
  DocumentDetail,
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
      createdDocument: DocumentDetail,
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
    'attachment upload failed': props<{
      documentId: string;
      attachmentId: string;
    }>(),
  },
});
