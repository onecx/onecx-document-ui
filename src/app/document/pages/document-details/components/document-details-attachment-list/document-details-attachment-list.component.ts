import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DocumentAttachmentFormValue } from '../../../../types/document-create.types';
import { formatBytes } from '../../../../utils/attachment.utils';

@Component({
  selector: 'app-document-details-attachment-list',
  templateUrl: './document-details-attachment-list.component.html',
  styleUrl: './document-details-attachment-list.component.scss',
})
export class DocumentDetailsAttachmentListComponent {
  @Input() attachments!: FormArray<FormGroup>;
  @Input() editMode = false;

  @Output() download = new EventEmitter<DocumentAttachmentFormValue>();
  @Output() retryUpload = new EventEmitter<{ id: string; fileName: string }>();

  readonly formatBytes = formatBytes;

  onDownloadClicked(attachmentFormGroup: FormGroup): void {
    this.download.emit(this.getAttachmentValue(attachmentFormGroup));
  }

  onRetryUploadClicked(attachmentFormGroup: FormGroup) {
    const { id, fileName } = this.getAttachmentValue(attachmentFormGroup);
    this.retryUpload.emit({ id: id!, fileName: fileName! });
  }

  trackByIndex(index: number): number {
    return index;
  }

  getUploadStatusKey(attachmentFormGroup: FormGroup): string {
    const uploadStatus = attachmentFormGroup.get('storageUploadStatus')?.value;
    return uploadStatus
      ? 'DOCUMENT_DETAILS.ATTACHMENTS.STATUS.UPLOADED'
      : 'DOCUMENT_DETAILS.ATTACHMENTS.STATUS.FAILED';
  }

  private getAttachmentValue(
    attachmentFormGroup: FormGroup
  ): DocumentAttachmentFormValue {
    return attachmentFormGroup.getRawValue() as DocumentAttachmentFormValue;
  }
}
