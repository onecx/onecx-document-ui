import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Attachment, DocumentDetail } from 'src/app/shared/generated';
import {
  DocumentAttachmentFormGroup,
  DocumentDetailsFormGroup,
} from '../../types/document-create.types';

export function createDocumentDetailsForm(): DocumentDetailsFormGroup {
  return new FormGroup({
    name: new FormControl<string | null>(null, [
      Validators.maxLength(255),
      Validators.required,
    ]),
    type: new FormControl<string | null>(null),
    version: new FormControl<string | null>(null, [Validators.maxLength(255)]),
    channel: new FormControl<string | null>(null, [Validators.required]),
    specification: new FormControl<string | null>(null),
    status: new FormControl<string | null>(null),
    description: new FormControl<string | null>(null, [
      Validators.maxLength(4000),
    ]),
    involvement: new FormControl<string | null>(null, [
      Validators.maxLength(255),
    ]),
    objectReferenceType: new FormControl<string | null>(null, [
      Validators.maxLength(255),
    ]),
    objectReferenceId: new FormControl<string | null>(null, [
      Validators.maxLength(255),
    ]),
    attachments: new FormArray<DocumentAttachmentFormGroup>([]),
  });
}

export function patchDocumentDetailsForm(
  formGroup: DocumentDetailsFormGroup,
  details?: DocumentDetail
): void {
  formGroup.patchValue({
    name: details?.name,
    type: details?.type?.id,
    version: details?.documentVersion,
    channel: details?.channel?.name,
    specification: details?.specification?.id,
    status: details?.lifeCycleState,
    description: details?.description,
    involvement: details?.relatedObject?.involvement,
    objectReferenceType: details?.relatedObject?.objectReferenceType,
    objectReferenceId: details?.relatedObject?.objectReferenceId,
  });

  setAttachmentsOnForm(formGroup, details?.attachments ?? []);
}

export function setAttachmentsOnForm(
  formGroup: DocumentDetailsFormGroup,
  attachments: Attachment[]
): void {
  const attachmentsFormArray = getAttachmentFormArray(formGroup);
  attachmentsFormArray.clear();

  attachments.forEach((attachment) => {
    attachmentsFormArray.push(createAttachmentFormGroup(attachment));
  });
}

export function getAttachmentFormArray(
  formGroup: DocumentDetailsFormGroup
): FormArray<DocumentAttachmentFormGroup> {
  return formGroup.controls.attachments;
}

function createAttachmentFormGroup(
  attachment: Attachment
): DocumentAttachmentFormGroup {
  return new FormGroup({
    id: new FormControl<string | null>(attachment.id ?? null),
    name: new FormControl<string | null>(attachment.name ?? null),
    description: new FormControl<string | null>(attachment.description ?? null),
    fileName: new FormControl<string | null>(attachment.fileName ?? null),
    type: new FormControl<string | null>(attachment.type ?? null),
    size: new FormControl<number | null>(attachment.size ?? null),
    sizeUnit: new FormControl<string | null>(attachment.sizeUnit ?? null),
    mimeTypeName: new FormControl<string | null>(
      attachment.mimeType?.name ?? null
    ),
    storageUploadStatus: new FormControl<boolean>(
      attachment.storageUploadStatus ?? false,
      { nonNullable: true }
    ),
  });
}
