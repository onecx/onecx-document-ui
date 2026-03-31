import { FormArray, FormControl, FormGroup } from '@angular/forms';
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

export interface DocumentCharacteristicFormValue {
  id: string | null;
  name: string | null;
  value: string | null;
}

export interface DocumentDetailsFormValue {
  name: string | null;
  type: string | null;
  version: string | null;
  channel: string | null;
  specification: string | null;
  status: string | null;
  description: string | null;
  involvement: string | null;
  objectReferenceType: string | null;
  objectReferenceId: string | null;
  attachments: DocumentAttachmentFormValue[];
  characteristics: DocumentCharacteristicFormValue[];
}

export type FormControlsOf<T extends object> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? FormArray<FormGroup<FormControlsOf<U & object>>>
    : FormControl<T[K]>;
};

export type DocumentAttachmentFormGroup = FormGroup<
  FormControlsOf<DocumentAttachmentFormValue>
>;

export type DocumentCharacteristicsFormGroup = FormGroup<
  FormControlsOf<DocumentCharacteristicFormValue>
>;

export type DocumentDetailsFormGroup = FormGroup<
  FormControlsOf<DocumentDetailsFormValue>
>;

export type DocumentCreateDetailsFormGroup = FormGroup<
  FormControlsOf<DocumentCreateDetailsStepData>
>;

export type DocumentAttachmentFormRawValue = ReturnType<
  DocumentAttachmentFormGroup['getRawValue']
>;

export type DocumentCharacteristicsFormRawValue = ReturnType<
  DocumentCharacteristicsFormGroup['getRawValue']
>;

export type DocumentDetailsFormRawValue = ReturnType<
  DocumentDetailsFormGroup['getRawValue']
>;

export type DocumentCreateDetailsStepData = Omit<
  DocumentDetailsFormValue,
  'attachments' | 'characteristics'
>;
