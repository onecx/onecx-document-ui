import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Attachment,
  DocumentCharacteristic,
  DocumentDetail,
} from 'src/app/shared/generated';
import {
  DocumentCreateDetailsFormGroup,
  DocumentAttachmentFormGroup,
  DocumentCharacteristicsFormGroup,
  DocumentDetailsFormGroup,
} from '../types/document-create.types';

export function createDocumentDetailsSectionForm(): DocumentCreateDetailsFormGroup {
  return new FormGroup({
    name: new FormControl<string | null>(null, [
      Validators.maxLength(255),
      Validators.required,
    ]),
    type: new FormControl<string | null>(null, [Validators.required]),
    version: new FormControl<string | null>(null, [Validators.maxLength(255)]),
    channel: new FormControl<string | null>(null, [Validators.required]),
    specification: new FormControl<string | null>(null),
    status: new FormControl<string | null>(null, [Validators.required]),
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
  });
}

export function createDocumentAttachmentsFormArray(): FormArray<DocumentAttachmentFormGroup> {
  return new FormArray<DocumentAttachmentFormGroup>([]);
}

export function createDocumentCharacteristicsFormArray(): FormArray<DocumentCharacteristicsFormGroup> {
  return new FormArray<DocumentCharacteristicsFormGroup>([]);
}

export function createDocumentDetailsForm(): DocumentDetailsFormGroup {
  const detailsSectionForm = createDocumentDetailsSectionForm();

  return new FormGroup({
    ...detailsSectionForm.controls,
    attachments: createDocumentAttachmentsFormArray(),
    characteristics: createDocumentCharacteristicsFormArray(),
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
  setCharacteristicsOnForm(
    formGroup,
    Array.from(details?.characteristics || [])
  );
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

export function setCharacteristicsOnForm(
  formGroup: DocumentDetailsFormGroup,
  characteristics: DocumentCharacteristic[]
) {
  const charsFormArray = getCharacteristicsFormArray(formGroup);
  charsFormArray.clear();

  characteristics.forEach((char) =>
    charsFormArray.push(createCharacteristicFormGroup(char))
  );
}

export function getAttachmentFormArray(
  formGroup: DocumentDetailsFormGroup
): FormArray<DocumentAttachmentFormGroup> {
  return formGroup.controls.attachments;
}

export function addCharacteristic(formGroup: DocumentDetailsFormGroup) {
  const existingChars = getCharacteristicsFormArray(formGroup);
  existingChars.push(createCharacteristicFormGroup());
}

export function removeCharacteristic(
  formGroup: DocumentDetailsFormGroup,
  index: number
) {
  const existingChars = getCharacteristicsFormArray(formGroup);
  existingChars.removeAt(index);
}

export function getCharacteristicsFormArray(
  formGroup: DocumentDetailsFormGroup
): FormArray<DocumentCharacteristicsFormGroup> {
  return formGroup.controls.characteristics;
}

export function createCharacteristicFormGroup(
  characteristic?: DocumentCharacteristic
): DocumentCharacteristicsFormGroup {
  return new FormGroup({
    id: new FormControl(characteristic?.id || null, []),
    name: new FormControl(characteristic?.name || null, [
      Validators.required,
      Validators.maxLength(255),
    ]),
    value: new FormControl(characteristic?.value || null, [
      Validators.required,
      Validators.maxLength(255),
    ]),
  });
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
