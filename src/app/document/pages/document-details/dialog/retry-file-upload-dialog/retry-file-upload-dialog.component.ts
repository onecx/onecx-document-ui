import { Component, Input } from '@angular/core';
import { DialogResult } from '@onecx/portal-integration-angular';

@Component({
  selector: 'app-retry-file-upload-dialog',
  templateUrl: './retry-file-upload-dialog.component.html',
  styleUrl: './retry-file-upload-dialog.component.scss',
})
export class RetryFileUploadDialogComponent
  implements DialogResult<File | null>
{
  @Input() fileName!: string;

  dialogResult: File | null = null;
  showFileNameMismatch = false;

  onFileSelected(file: File) {
    if (file.name !== this.fileName) {
      this.showFileNameMismatch = true;
      return;
    }
    this.showFileNameMismatch = false;
    this.dialogResult = file;
  }
}
