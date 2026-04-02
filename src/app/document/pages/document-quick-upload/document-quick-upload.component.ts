import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeIcons, SelectItem } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import {
  BreadcrumbService,
  PrimeIcon,
} from '@onecx/portal-integration-angular';
import {
  AttachmentCreateUpdate,
  DocumentCreateUpdate,
} from 'src/app/shared/generated';
import {
  AttachmentData,
  AttachmentFile,
} from '../../types/document-create.types';
import { formatBytes } from '../../utils/attachment.utils';
import { Store } from '@ngrx/store';
import {
  documentQuickUploadSelectors,
  selectQuickUploadDocumentTypes,
  selectQuickUploadMimeTypes,
} from './document-quick-upload.selectors';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';

enum SortOrder {
  ASCENDING,
  DESCENDING,
}

@Component({
  selector: 'app-document-quick-upload',
  templateUrl: './document-quick-upload.component.html',
  styleUrls: ['./document-quick-upload.component.scss'],
})
export class DocumentQuickUploadComponent implements OnInit, OnDestroy {
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

  private subs = new Subscription();
  readonly formatBytes = formatBytes;

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
    this.subs.add(
      this.store
        .select(documentQuickUploadSelectors.selectOptionsLoading)
        .subscribe((isLoading) => {
          this.isSubmitted = isLoading;
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
  onSave(): void {
    const createRequest: DocumentCreateUpdate = {
      name: this.documentQuickUploadForm.controls['documentName'].value,
      typeId: this.documentQuickUploadForm.controls['typeId'].value,
      lifeCycleState:
        this.documentQuickUploadForm.controls['lifeCycleState'].value,
      channel: {
        name: this.documentQuickUploadForm.controls['channelname'].value,
      },
      tags: [],
      documentRelationships: [],
      characteristics: [],
      relatedParties: [],
      categories: [],
      attachments: this.mapAttachments(),
    };
    const fileToUpload = this.mapUploads();
    this.isSubmitted = true;
    this.documentQuickUploadForm.disable();
    this.store.dispatch(
      DocumentCreateOperationsActions.startDocumentCreation({
        docRequest: createRequest,
        files: fileToUpload,
      })
    );
  }

  /**
   * onCancel to cancel the quick upload dialog
   */
  onCancel() {
    const documentQuickUploadform = this.documentQuickUploadForm.value;
    let flagIsValid = false;
    for (const detail in documentQuickUploadform) {
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
    this.router.navigate(['../'], {
      relativeTo: this.activeRoute,
    });
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

  getAttachmentIcon(attachment: AttachmentData): PrimeIcon {
    const fileTypeData = attachment?.fileData ? attachment.fileData.type : '';

    if (fileTypeData) {
      const fileType = fileTypeData.split('/');
      if (fileType.length) {
        const type = fileType[0].toLowerCase();
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
  private mapUploads(): AttachmentFile[] {
    return this.attachmentArray.map((element) => ({
      file: element.fileData,
      fileName: element.fileName!,
    }));
  }

  /**
   * Sorting the field as per field names
   */
  private updateSorting(): void {
    if (this.sortField === 'fileData.name') {
      this.sortOrder = this.sortOrderType === SortOrder.ASCENDING ? -1 : 1;
    } else {
      this.sortOrder = this.sortOrderType === SortOrder.ASCENDING ? 1 : -1;
    }
  }

  /**
   * function to enable or disable create button according to file isValid flag
   */
  private validateAttachmentArray(): void {
    if (this.attachmentArray.length) {
      const invalidAttachment = this.attachmentArray.filter(
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
}
