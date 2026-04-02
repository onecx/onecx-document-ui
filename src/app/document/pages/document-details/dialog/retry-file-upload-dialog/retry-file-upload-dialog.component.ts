import { Component } from '@angular/core';
import { DialogResult } from '@onecx/portal-integration-angular';

@Component({
  selector: 'app-retry-file-upload-dialog',
  templateUrl: './retry-file-upload-dialog.component.html',
  styleUrl: './retry-file-upload-dialog.component.scss',
})
export class RetryFileUploadDialogComponent
  implements DialogResult<File | null>
{
  dialogResult: File | null = null;

  onFileSelected(file: File) {
    this.dialogResult = file;
  }
}
