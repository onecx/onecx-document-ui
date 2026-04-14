import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { AttachmentDraft } from '../../../../types/document-create.types';
import { AttachmentFormGroup } from './document-create-attachments.types';

@Component({
  selector: 'app-document-create-attachments',
  templateUrl: './document-create-attachments.component.html',
})
export class DocumentCreateAttachmentsComponent implements OnInit {
  @Input() attachments: AttachmentDraft[] = [];
  @Input() supportedMimeTypes: SelectItem[] = [];

  @Output() back = new EventEmitter<AttachmentDraft[]>();
  @Output() next = new EventEmitter<AttachmentDraft[]>();
  @Output() attachmentMimeTypeNotSupported = new EventEmitter<string>();

  attachmentForms = new FormArray<AttachmentFormGroup>([]);
  files: File[] = [];
  selectedIndex = 0;

  ngOnInit(): void {
    this.attachments.forEach((draft) => {
      this.files.push(draft.file);
      this.addFormEntry(draft);
    });
  }

  selectAttachment(index: number): void {
    this.selectedIndex = index;
  }

  onFileSelected(file: File): void {
    const mimeItem = this.supportedMimeTypes.find(
      (item) => item.label === file.type
    );
    if (!mimeItem) {
      this.attachmentMimeTypeNotSupported.emit(file.name);
      return;
    }
    const draft: AttachmentDraft = {
      name: file.name,
      description: null,
      mimeTypeId: mimeItem.value,
      validForEnd: null,
      fileName: file.name,
      file,
    };
    this.files.push(file);
    this.addFormEntry(draft);
    this.selectedIndex = this.attachmentForms.length - 1;
  }

  removeAttachment(index: number): void {
    this.attachmentForms.removeAt(index);
    this.files.splice(index, 1);
    if (this.selectedIndex >= this.attachmentForms.length) {
      this.selectedIndex = Math.max(0, this.attachmentForms.length - 1);
    }
  }

  onBack(): void {
    this.back.emit(this.buildDrafts());
  }

  onNext(): void {
    this.attachmentForms.markAllAsTouched();
    if (!this.isFormValid()) return;
    this.next.emit(this.buildDrafts());
  }

  isFormValid(): boolean {
    return this.attachmentForms.valid && this.attachmentForms.length > 0;
  }

  isFieldInvalid(form: AttachmentFormGroup, field: string): boolean {
    const control = form.get(field);
    return !!control && control.invalid && control.touched;
  }

  private addFormEntry(draft: AttachmentDraft): void {
    const mimeType =
      this.supportedMimeTypes.find((m) => m.value === draft.mimeTypeId)
        ?.label ?? draft.mimeTypeId;
    const group: AttachmentFormGroup = new FormGroup({
      name: new FormControl<string | null>(draft.name, [
        Validators.required,
        Validators.maxLength(255),
      ]),
      mimeTypeId: new FormControl<string | null>(draft.mimeTypeId),
      mimeTypeName: new FormControl<string | null>({
        value: mimeType,
        disabled: true,
      }),
      validForEnd: new FormControl<string | null>(draft.validForEnd),
      description: new FormControl<string | null>(draft.description, [
        Validators.maxLength(4000),
      ]),
    });
    this.attachmentForms.push(group);
  }

  private buildDrafts(): AttachmentDraft[] {
    return this.attachmentForms.controls.map((form, index) => ({
      name: form.controls.name.value,
      description: form.controls.description.value,
      mimeTypeId: form.controls.mimeTypeId.value,
      validForEnd: form.controls.validForEnd.value,
      fileName: this.files[index].name,
      file: this.files[index],
    }));
  }

  get selectedForm(): AttachmentFormGroup | null {
    return this.attachmentForms.at(this.selectedIndex) ?? null;
  }
}
