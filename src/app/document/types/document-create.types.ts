import { Attachment, AttachmentCreateUpdate } from 'src/app/shared/generated';

export type AttachmentFile = {
  attachmentId: string;
  file: File;
};

export type AttachmentData = AttachmentCreateUpdate & {
  fileData: File;
  isValid?: boolean;
};
