import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeIcons, SelectItem } from 'primeng/api';
import { Observable } from 'rxjs';
import {
  BreadcrumbService,
  PrimeIcon,
} from '@onecx/portal-integration-angular';
import {
  AttachmentCreateUpdate,
  DocumentCreateUpdate,
} from 'src/app/shared/generated';
import { AttachmentData } from '../../types/document-create.types';
import { Store } from '@ngrx/store';
import {
  selectQuickUploadDocumentTypes,
  selectQuickUploadMimeTypes,
} from './document-quick-upload.selectors';

enum SortOrder {
  ASCENDING,
  DESCENDING,
}

@Component({
  selector: 'app-document-quick-upload',
  templateUrl: './document-quick-upload.component.html',
  styleUrls: ['./document-quick-upload.component.scss'],
})
export class DocumentQuickUploadComponent implements OnInit {
  sortOrder = -1;
  rowsPerPage = 10;
  rowsPerPageOptions = [10, 20, 50];
  enableCreateButton = false;
  formValid = false;
  isSubmitted = false;
  cancelDialogVisible = false;

  documentQuickUploadForm!: UntypedFormGroup;
  sortOrderType: SortOrder = SortOrder.DESCENDING;
  attachmentArray: AttachmentData[] = [];
  sortField = '';
  layout: 'list' | 'grid' = 'grid';

  constructor(
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.documentQuickUploadForm = new FormGroup({
      documentName: new FormControl('', [Validators.required]),
      typeId: new FormControl('', [Validators.required]),
      channelname: new FormControl('', [Validators.required]),
      lifeCycleState: new FormControl(),
    });
    this.breadcrumbService.setItems([
      {
        labelKey: 'DOCUMENT_SEARCH.HEADER',
        titleKey: 'DOCUMENT_SEARCH.HEADER',
        routerLink: '../',
      },
      {
        labelKey: 'DOCUMENT_QUICK_UPLOAD.HEADER',
        titleKey: 'DOCUMENT_QUICK_UPLOAD.HEADER',
      },
    ]);
  }

  /**
   * Tracks the updated value of view layout
   */
  updateAttachmentsLayout(layout: 'list' | 'grid'): void {
    this.layout = layout;
  }
  /**
   * function to enable create button to create new document
   * @param event which has boolean value
   */
  createButtonEnable(enabled: boolean): void {
    this.enableCreateButton = enabled;
  }
  /**
   * function to check form is valid or not to create document
   * @param e
   */
  setFormValid(form: UntypedFormGroup): void {
    this.formValid = form.valid;
    this.documentQuickUploadForm = form;
  }
  /**
   * function to save attachment list in attachment array
   * @param e
   */
  setAttachmentArray(attachments: AttachmentData[]): void {
    this.attachmentArray = attachments;
  }

  /**
   * Reload the view on choosing the attachments
   */
  refreshAttachmentList(_hasFiles: boolean): void {}

  /**
   * Add the sort type
   */
  onSortOrderChange(sortOrder: boolean) {
    this.sortOrderType =
      sortOrder === true ? SortOrder.ASCENDING : SortOrder.DESCENDING;
    this.updateSorting();
  }
  /**
   * Add sort field
   */
  onSortFieldChange(sortField: string) {
    this.sortField = sortField;
    this.updateSorting();
  }
  /**
   * Sorting the field as per field names
   */
  updateSorting() {
    if (this.sortField === 'fileData.name') {
      this.sortOrder = this.sortOrderType === SortOrder.ASCENDING ? -1 : 1;
    } else {
      this.sortOrder = this.sortOrderType === SortOrder.ASCENDING ? 1 : -1;
    }
  }

  /**
   * Returns set of attachment array that user has uploaded
   */

  private mapAttachments(): AttachmentCreateUpdate[] {
    return this.attachmentArray.map((element) => ({
      name: element.name!,
      description: element.description!,
      mimeTypeId: element.mimeTypeId!,
      validFor: {
        startDateTime: undefined,
        endDateTime: element.validFor?.endDateTime,
      },
      fileName: element.fileName,
    }));
  }

  /**
   * Returns set of files array that user has uploaded
   */
  private mapUploads(): { file: File }[] {
    try {
      return this.attachmentArray.map((element) => ({
        file: element.fileData,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  /**
   * Creates new document. Returns a successful message on successful creation of document else returns an error message
   */

  /*
    @Description -> initializing the documentCreateUpdateDTO object and passing that object as parameter to callCreateDocumentApi
  */

  public onSave(): void {
    const createRequest: DocumentCreateUpdate = {
      name: this.documentQuickUploadForm.controls['documentName'].value,
      typeId: this.documentQuickUploadForm.controls['typeId'].value,
      lifeCycleState:
        this.documentQuickUploadForm.controls['lifeCycleState'].value,
      channel: {
        name: this.documentQuickUploadForm.controls['channelname'].value,
      },
      attachments: this.mapAttachments(),
    };
    this.isSubmitted = true;
    this.documentQuickUploadForm.disable();
    // this.callCreateDocumentApi(this.documentCreateUpdateDTO);
  }

  /**
   * @param  documentCreateUpdateDTO object
   * @Description calls the service class to send the object to the backend and sends the documentId (received from response object) to the callUploadAttachmentApi
   */

  /**
   * onCancel to cancel the quick upload dialog
   * @param event
   */

  onCancel() {
    let documentQuickUploadform = this.documentQuickUploadForm.value;
    let flagIsValid = false;
    for (let detail in documentQuickUploadform) {
      if (detail != 'lifeCycleState' && documentQuickUploadform[detail]) {
        flagIsValid = true;
      }
    }
    if (
      flagIsValid ||
      documentQuickUploadform.dirty ||
      this.attachmentArray.length
    ) {
      this.cancelDialogVisible = true;
    } else {
      this.router.navigate(['../'], {
        relativeTo: this.activeRoute,
      });
    }
  }

  /***function for no option on cancel dialogue */
  onCancelNo() {
    this.cancelDialogVisible = false;
  }

  /***function for Yes option on cancel dialogue */
  onCancelYes() {
    this.router.navigate(['../../search'], {
      relativeTo: this.activeRoute,
    });
  }
  /**
   * function to convert bytes to KB or MB according to bytes value
   * @param bytes file size value
   * @param decimal decimal places after decimal point. Default value is 2
   */
  formatBytes(bytes: number, decimals = 2) {
    try {
      bytes = +bytes;
      if (isNaN(bytes)) return false;
      if (bytes == 0) {
        return '0 Bytes';
      } else if (bytes > 0) {
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${
          sizes[i]
        }`;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * function to check if file is valid according to allowed file size
   * @param file file data
   */
  isValidFile(file: File): boolean {
    const fileSize = file.size ?? 0;
    return fileSize > 0 && fileSize <= 2097152;
  }

  /**
   * function to remove file from attachmentArray according to array index
   * @param index index of current file
   */
  onDeleteUploadFile(attachment: AttachmentData) {
    this.attachmentArray = this.attachmentArray.filter(
      (obj) => obj != attachment
    );
    this.validateAttachmentArray();
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
        this.enableCreateButton = false;
      } else {
        this.enableCreateButton = true;
      }
    } else {
      this.enableCreateButton = false;
    }
  }

  getAttachmentIcon(attachment: AttachmentData): PrimeIcon {
    let fileName = attachment.fileName ?? '';
    let fileExtension = fileName.split('.').reverse();
    let fileTypeData = attachment?.fileData ? attachment.fileData.type : '';
    let attachmentIcon = '';

    if (fileTypeData) {
      let fileType = fileTypeData.split('/');
      if (fileType.length) {
        let type = fileType[0].toLowerCase();
        if (type === 'audio') {
          return PrimeIcons.MICROPHONE;
        }
        if (type === 'video') {
          return PrimeIcons.VIDEO;
        }
        if (type === 'image') {
          return PrimeIcons.IMAGE;
        }
      }
    }
    return PrimeIcons.FILE;
  }

  /**
   * function to enable or disable Pagination according to the attachmentArray length
   */
  get isPaginatorVisible(): boolean {
    if (this.attachmentArray.length == 0) {
      return false;
    }
    return true;
  }

  get documentTypes$(): Observable<SelectItem[]> {
    return this.store.select(selectQuickUploadDocumentTypes);
  }

  get mimeTypes$(): Observable<SelectItem[]> {
    return this.store.select(selectQuickUploadMimeTypes);
  }
}
