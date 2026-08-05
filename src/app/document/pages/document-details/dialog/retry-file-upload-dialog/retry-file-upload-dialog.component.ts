import { Component, Input } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { DialogResult } from '@onecx/angular-accelerator'
import { FileUploadComponent } from 'src/app/document/components/file-upload/file-upload.component'

@Component({
  selector: 'app-retry-file-upload-dialog',
  imports: [TranslateModule, FileUploadComponent],
  templateUrl: './retry-file-upload-dialog.component.html'
})
export class RetryFileUploadDialogComponent implements DialogResult<File | null> {
  @Input() fileName!: string

  dialogResult: File | null = null
  showFileNameMismatch = false

  onFileSelected(file: File) {
    if (file.name !== this.fileName) {
      this.showFileNameMismatch = true
      return
    }
    this.showFileNameMismatch = false
    this.dialogResult = file
  }
}
