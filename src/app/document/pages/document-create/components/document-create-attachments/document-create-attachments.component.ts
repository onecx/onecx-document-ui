import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { SelectItem } from 'primeng/api'
import { AttachmentDraft } from '../../../../types/document-create.types'
import { AttachmentFormGroup } from './document-create-attachments.types'
import { TranslateModule } from '@ngx-translate/core'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { TableModule } from 'primeng/table'
import { TooltipModule } from 'primeng/tooltip'
import { DatePickerModule } from 'primeng/datepicker'
import { FileUploadComponent } from 'src/app/document/components/file-upload/file-upload.component'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-document-create-attachments',
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    TableModule,
    DatePickerModule,
    FileUploadComponent
  ],
  templateUrl: './document-create-attachments.component.html'
})
export class DocumentCreateAttachmentsComponent implements OnInit {
  @Input() attachments: AttachmentDraft[] = []
  @Input() supportedMimeTypes: SelectItem[] = []

  @Output() back = new EventEmitter<AttachmentDraft[]>()
  @Output() next = new EventEmitter<AttachmentDraft[]>()
  @Output() attachmentMimeTypeNotSupported = new EventEmitter<string>()

  attachmentForms = new FormArray<AttachmentFormGroup>([])
  files: File[] = []
  selectedIndex = 0

  ngOnInit(): void {
    this.attachments.forEach((draft) => {
      this.files.push(draft.file)
      this.addFormEntry(draft)
    })
  }

  selectAttachment(index: number): void {
    this.selectedIndex = index
  }

  onFileSelected(file: File): void {
    const mimeItem = this.supportedMimeTypes.find((item) => item.label === file.type)
    if (!mimeItem) {
      this.attachmentMimeTypeNotSupported.emit(file.name)
      return
    }
    const draft: AttachmentDraft = {
      name: file.name,
      description: null,
      mimeType: mimeItem.value,
      validForEnd: null,
      fileName: file.name,
      file
    }
    this.files.push(file)
    this.addFormEntry(draft)
    this.selectedIndex = this.attachmentForms.length - 1
  }

  removeAttachment(index: number): void {
    this.attachmentForms.removeAt(index)
    this.files.splice(index, 1)
    if (this.selectedIndex >= this.attachmentForms.length) {
      this.selectedIndex = Math.max(0, this.attachmentForms.length - 1)
    }
  }

  onBack(): void {
    this.back.emit(this.buildDrafts())
  }

  onNext(): void {
    this.attachmentForms.markAllAsTouched()
    if (!this.isFormValid()) return
    this.next.emit(this.buildDrafts())
  }

  isFormValid(): boolean {
    return this.attachmentForms.valid && this.attachmentForms.length > 0
  }

  isFieldInvalid(form: AttachmentFormGroup, field: string): boolean {
    const control = form.get(field)
    return !!control && control.invalid && control.touched
  }

  private addFormEntry(draft: AttachmentDraft): void {
    const mimeType = this.supportedMimeTypes.find((m) => m.value === draft.mimeType)?.label ?? draft.mimeType
    const group: AttachmentFormGroup = new FormGroup({
      name: new FormControl<string | null>(draft.name, [Validators.required, Validators.maxLength(255)]),
      mimeType: new FormControl<string | null>({
        value: mimeType,
        disabled: true
      }),
      validForEnd: new FormControl<string | null>(draft.validForEnd),
      description: new FormControl<string | null>(draft.description, [Validators.maxLength(4000)])
    })
    this.attachmentForms.push(group)
  }

  private buildDrafts(): AttachmentDraft[] {
    return this.attachmentForms.controls.map((form, index) => ({
      name: form.controls.name.value,
      description: form.controls.description.value,
      mimeType: form.controls.mimeType.value,
      validForEnd: form.controls.validForEnd.value,
      fileName: this.files[index].name,
      file: this.files[index]
    }))
  }

  get selectedForm(): AttachmentFormGroup | null {
    return this.attachmentForms.at(this.selectedIndex) ?? null
  }
}
