import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Attachment, DocumentDetail } from 'src/app/shared/generated';

export function createDocumentDetailsForm(): FormGroup {
  return new FormGroup({
    id: new FormControl(null, [Validators.maxLength(255)]),
    name: new FormControl(null, [Validators.maxLength(255)]),
    type: new FormControl(null),
    version: new FormControl(null, [Validators.maxLength(255)]),
    channel: new FormControl(null),
    specification: new FormControl(null),
    status: new FormControl(null),
    description: new FormControl(null, [Validators.maxLength(4000)]),
    involvement: new FormControl(null, [Validators.maxLength(255)]),
    objectReferenceType: new FormControl(null, [Validators.maxLength(255)]),
    objectReferenceId: new FormControl(null, [Validators.maxLength(255)]),
    attachments: new FormArray<FormGroup>([]),
  });
}

export function patchDocumentDetailsForm(
  formGroup: FormGroup,
  details?: DocumentDetail
): void {
  formGroup.patchValue({
    id: details?.id,
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
  formGroup: FormGroup,
  attachments: Attachment[]
): void {
  const attachmentsFormArray = getAttachmentFormArray(formGroup);
  attachmentsFormArray.clear();

  attachments.forEach((attachment) => {
    attachmentsFormArray.push(createAttachmentFormGroup(attachment));
  });
}

export function getAttachmentFormArray(
  formGroup: FormGroup
): FormArray<FormGroup> {
  return formGroup.get('attachments') as FormArray<FormGroup>;
}

function createAttachmentFormGroup(attachment: Attachment): FormGroup {
  return new FormGroup({
    id: new FormControl(attachment.id ?? null),
    name: new FormControl(attachment.name ?? null),
    description: new FormControl(attachment.description ?? null),
    fileName: new FormControl(attachment.fileName ?? null),
    type: new FormControl(attachment.type ?? null),
    size: new FormControl(attachment.size ?? null),
    sizeUnit: new FormControl(attachment.sizeUnit ?? null),
    mimeTypeName: new FormControl(attachment.mimeType?.name ?? null),
    storageUploadStatus: new FormControl(
      attachment.storageUploadStatus ?? false
    ),
  });
}
