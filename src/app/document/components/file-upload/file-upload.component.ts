import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() disabled = false
  @Input() multiple = false

  @Output() fileSelected = new EventEmitter<File>()
  @Output() filesSelected = new EventEmitter<File[]>()

  allowDrop(event: Event): void {
    event.preventDefault()
  }

  onDrop(event: DragEvent): void {
    event.preventDefault()
    const files = event.dataTransfer?.files
    if (!files?.length) return
    this.emitFiles(Array.from(files))
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement
    const files = input.files
    if (!files?.length) return
    this.emitFiles(Array.from(files))
    input.value = ''
  }

  private emitFiles(files: File[]): void {
    if (this.multiple) {
      this.filesSelected.emit(files)
    } else {
      this.fileSelected.emit(files[0])
    }
  }
}
