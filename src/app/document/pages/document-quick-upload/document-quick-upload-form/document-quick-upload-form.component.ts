// Core imports
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';

// Third party imports
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { AttachmentData } from 'src/app/document/types/document-create.types';
import {
  noSpecialCharacters,
  trimSpaces,
} from 'src/app/document/utils/attachment.utils';
import { LifeCycleState } from 'src/app/shared/generated';

@Component({
  selector: 'app-document-quick-upload-form',
  templateUrl: './document-quick-upload-form.component.html',
  styleUrls: ['./document-quick-upload-form.component.scss'],
})
export class DocumentQuickUploadFormComponent implements OnInit {
  @Input() attachmentArray: AttachmentData[] = [];
  @Input() documentTypes: SelectItem[] = [];
  @Input() supportedMimeType: SelectItem[] = [];
  @Output() enableCreateButton = new EventEmitter<boolean>();
  @Output() formValid = new EventEmitter<any>();
  @Output() attchmentList = new EventEmitter<any>();
  @Output() selectedFileList = new EventEmitter<any>();

  showToaster = false;
  isSubmitted = false;

  documentQuickUploadForm!: UntypedFormGroup;
  documentStatus: SelectItem[] = [];
  translatedData: any;

  constructor(private readonly translateService: TranslateService) {}

  ngOnInit(): void {
    this.getTranslatedData();
    this.documentQuickUploadForm = new FormGroup({
      documentName: new FormControl('', [
        Validators.required,
        noSpecialCharacters,
      ]),
      typeId: new FormControl('', [Validators.required]),
      channelname: new FormControl('', [Validators.required]),
      lifeCycleState: new FormControl(),
    });
    this.loadDocumentStatus();
    this.documentQuickUploadForm.valueChanges.subscribe(() => {
      this.formValid.emit(this.documentQuickUploadForm);
    });
  }
  /**
   * function to get translatedData from translateService
   */
  getTranslatedData(): void {
    this.translateService
      .get([
        'DOCUMENT_QUICK_UPLOAD.CREATE_SUCCESS',
        'DOCUMENT_QUICK_UPLOAD.CREATE_ERROR',
        'DOCUMENT_QUICK_UPLOAD.ATTACHMENTS.UPLOAD_SUCCESS',
        'DOCUMENT_QUICK_UPLOAD.ATTACHMENTS.UPLOAD_ERROR',
        'DOCUMENT_QUICK_UPLOAD.CANCEL_MODAL.CANCEL_CONFIRM_MESSAGE',
        'GENERAL.PROCESSING',
      ])
      .subscribe((data) => {
        this.translatedData = data;
      });
  }
  /**
   *function to trim empty space from the begining and end of the form field on blur event
   */
  trimSpace(event: FocusEvent): void {
    const target = event.target as HTMLInputElement;
    const controlName = target.getAttribute('formControlName');
    const value = target.value.trim();
    this.documentQuickUploadForm.controls[controlName!].setValue(value);
  }
  /**
   * function to trim empty space from the begining and end of the form field on paste event
   */
  trimSpaceOnPaste(
    event: ClipboardEvent,
    controlName: string,
    maxlength: number
  ) {
    this.documentQuickUploadForm = trimSpaces(
      event,
      controlName,
      this.documentQuickUploadForm,
      maxlength
    );
  }
  /**
   * function to eliminate space from the beginning of the required fields on key press event
   */
  preventSpace(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    if (target.selectionStart === 0 && event.code === 'Space')
      event.preventDefault();
  }

  /**
   * function to reterive document status
   */
  private loadDocumentStatus(): void {
    this.documentStatus = Object.keys(LifeCycleState).map((key) => ({
      label: key,
      value: key,
    }));
    // set "DRAFT" as default value for document status dropdown
    let docStatusDraft = this.documentStatus.filter(
      (document) => document.value.toLowerCase() == 'draft'
    );
    if (docStatusDraft.length > 0) {
      this.documentQuickUploadForm.controls['lifeCycleState'].patchValue(
        this.documentStatus[1].value
      );
    }
  }

  /**
   * function to handle input file event
   * @param event change event raised by input element while uploading file
   */
  addFile(event: Event) {
    this.selectedFileList.emit(false);
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files?.length) {
      for (let i = 0; i < files.length; i++) {
        this.enterDataToListView(files[i]);
      }
    }
    this.validateAttachmentArray();
  }

  /**
   * function to manipulate and store file data in attachmentArray
   * @param file file object having uploaded file data
   */
  enterDataToListView(file: File) {
    const attachmntObj: AttachmentData = {
      name: file.name,
      fileData: file,
      isValid: false,
      fileName: file.name,
    };
    const uploadFileMimetype = file.type;
    this.supportedMimeType = this.supportedMimeType?.length
      ? this.supportedMimeType
      : [];
    const arr = this.supportedMimeType.filter((results) => {
      return results.label === uploadFileMimetype;
    });
    if (arr.length) {
      attachmntObj.mimeTypeId = arr[0].value;
    }
    attachmntObj.isValid = this.isValidFile(attachmntObj);
    this.attachmentArray.reverse();
    this.attachmentArray.push(attachmntObj);
    this.sortAttachmentArray();
    this.attchmentList.emit([...this.attachmentArray]);
    this.selectedFileList.emit(true);
  }

  /**
   * function to check if file is valid according to allowed file size
   * @param file file data
   */
  isValidFile(file: AttachmentData): boolean {
    const fileSize = file.fileData.size ?? 0;
    const mimeTypeId = file.mimeTypeId;
    return !!(mimeTypeId && fileSize && fileSize <= 2097152);
  }

  /**
   * function to handle drop event for drag & drop functionality
   * @param event web API drop event
   */
  dropFile(event: DragEvent) {
    event.preventDefault();
    let files = event.dataTransfer?.files;
    if (files?.length) {
      for (let i = 0; i < files.length; i++) {
        this.enterDataToListView(files[i]);
      }
    }
    this.validateAttachmentArray();
  }

  /**
   * function to handle dragover event for drag & drop functionality
   * @param event web API dragover event
   */
  allowDrop(event: Event) {
    event.preventDefault();
  }

  /**
   * function to enable or disable create button according to file isValid flag
   */
  validateAttachmentArray() {
    if (this.attachmentArray.length) {
      let invalidAttachment = this.attachmentArray.filter(
        (attachment) => !attachment.isValid
      );
      if (invalidAttachment.length) {
        this.enableCreateButton.emit(false);
      } else {
        this.enableCreateButton.emit(true);
      }
    } else {
      this.enableCreateButton.emit(false);
    }
  }

  /**
   * Function to show failed documents at top of the list
   */
  sortAttachmentArray() {
    let validAttachmentArray: any = [];
    let inValidAttachmentArray: any = [];
    this.attachmentArray.forEach((element) => {
      if (!element['isValid']) {
        inValidAttachmentArray.unshift(element);
      }
    });
    this.attachmentArray.forEach((element) => {
      if (element['isValid']) {
        validAttachmentArray.unshift(element);
      }
    });
    this.attachmentArray = inValidAttachmentArray.concat(validAttachmentArray);
  }
}
