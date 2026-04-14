import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Action, BreadcrumbService } from '@onecx/portal-integration-angular';
import { map, Observable, Subscription } from 'rxjs';

import { FormArray } from '@angular/forms';
import { PrimeIcons, SelectItem } from 'primeng/api';
import { DocumentDetailsActions } from './document-details.actions';
import {
  selectDocumentDetailsViewModel,
  selectDocumentTypes,
} from './document-details.selectors';
import { DocumentDetailsViewModel } from './document-details.viewmodel';
import {
  addCharacteristic,
  createDocumentDetailsForm,
  getAttachmentFormArray,
  getCharacteristicsFormArray,
  patchDocumentDetailsForm,
  removeCharacteristic,
} from '../../utils/document-details-form.factory';
import {
  DocumentAttachmentFormGroup,
  DocumentAttachmentFormValue,
  DocumentCharacteristicsFormGroup,
  DocumentDetailsFormGroup,
} from '../../types/document-create.types';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
})
export class DocumentDetailsComponent implements OnInit, OnDestroy {
  viewModel$: Observable<DocumentDetailsViewModel>;

  headerActions$!: Observable<Action[]>;

  public formGroup!: DocumentDetailsFormGroup;

  private readonly sub = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly breadcrumbService: BreadcrumbService
  ) {
    this.viewModel$ = this.store.select(selectDocumentDetailsViewModel);
    this.setForm();
    this.makeSubscriptions();
    this.setHeaderActions();
  }

  ngOnInit(): void {
    this.breadcrumbService.setItems([
      {
        labelKey: 'DOCUMENT_SEARCH.HEADER',
        titleKey: 'DOCUMENT_SEARCH.HEADER',
        routerLink: '../..',
      },
      {
        titleKey: 'DOCUMENT_DETAILS.BREADCRUMB',
        labelKey: 'DOCUMENT_DETAILS.BREADCRUMB',
      },
    ]);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  edit() {
    this.store.dispatch(DocumentDetailsActions.editButtonClicked());
  }

  cancel() {
    this.store.dispatch(
      DocumentDetailsActions.cancelButtonClicked({
        dirty: this.formGroup.dirty,
      })
    );
  }

  save() {
    this.store.dispatch(
      DocumentDetailsActions.saveButtonClicked({
        details: this.formGroup.getRawValue(),
      })
    );
  }

  delete() {
    this.store.dispatch(DocumentDetailsActions.deleteButtonClicked());
  }

  onAttachmentDownload(attachment: DocumentAttachmentFormValue): void {
    this.store.dispatch(
      DocumentDetailsActions.startAttachmentDownload({
        attachmentId: attachment.id!,
        fileName: attachment.fileName!,
      })
    );
  }

  onCharacteristicRemove(index: number) {
    removeCharacteristic(this.formGroup, index);
  }

  onCharacteristicAdd() {
    addCharacteristic(this.formGroup);
  }

  onFileUploadRetry({ id, fileName }: { id: string; fileName: string }) {
    this.store.dispatch(
      DocumentDetailsActions.retryFileUpload({ attachmentId: id, fileName })
    );
  }

  private makeSubscriptions() {
    this.sub.add(this.viewModel$.subscribe((vm) => this.updateFormValue(vm)));
  }

  private setForm() {
    this.formGroup = createDocumentDetailsForm();
    this.formGroup.disable();
  }

  private setHeaderActions() {
    this.headerActions$ = this.viewModel$.pipe(
      map((vm) => {
        const actions: Action[] = [
          {
            titleKey: 'DOCUMENT_DETAILS.GENERAL.BACK',
            labelKey: 'DOCUMENT_DETAILS.GENERAL.BACK',
            show: 'always',
            disabled: !vm.backNavigationPossible,
            showCondition: !vm.editMode,
            actionCallback: () => {
              this.store.dispatch(
                DocumentDetailsActions.navigateBackButtonClicked()
              );
            },
          },
          {
            titleKey: 'DOCUMENT_DETAILS.GENERAL.EDIT',
            labelKey: 'DOCUMENT_DETAILS.GENERAL.EDIT',
            show: 'always',
            icon: PrimeIcons.PENCIL,
            conditional: true,
            permission: 'DOCUMENT#WRITE',
            showCondition: !vm.editMode,
            actionCallback: () => {
              this.edit();
            },
          },
          {
            titleKey: 'DOCUMENT_DETAILS.GENERAL.CANCEL',
            labelKey: 'DOCUMENT_DETAILS.GENERAL.CANCEL',
            show: 'always',
            icon: PrimeIcons.TIMES,
            conditional: true,
            showCondition: vm.editMode,
            disabled: vm.isSubmitting,
            actionCallback: () => {
              this.cancel();
            },
          },
          {
            titleKey: 'DOCUMENT_DETAILS.GENERAL.SAVE',
            labelKey: 'DOCUMENT_DETAILS.GENERAL.SAVE',
            show: 'always',
            icon: PrimeIcons.SAVE,
            conditional: true,
            disabled: vm.isSubmitting,
            showCondition: vm.editMode,
            actionCallback: () => {
              this.save();
            },
          },
          {
            titleKey: 'DOCUMENT_DETAILS.GENERAL.DELETE',
            labelKey: 'DOCUMENT_DETAILS.GENERAL.DELETE',
            icon: PrimeIcons.TRASH,
            show: 'asOverflow',
            btnClass: '',
            conditional: true,
            showCondition: !vm.editMode,
            actionCallback: () => {
              this.delete();
            },
          },
        ];
        return actions;
      })
    );
  }

  private updateFormValue(vm: DocumentDetailsViewModel) {
    if (!vm.editMode) {
      patchDocumentDetailsForm(this.formGroup, vm.details);
      this.formGroup.markAsPristine();
    }

    this.toggleFormState(vm.editMode);
  }

  private toggleFormState(editMode: boolean): void {
    if (editMode) {
      this.formGroup.enable();
      return;
    }

    this.formGroup.disable();
  }

  get documentTypes$(): Observable<SelectItem[]> {
    return this.store.select(selectDocumentTypes);
  }

  get attachmentsFormArray(): FormArray<DocumentAttachmentFormGroup> {
    return getAttachmentFormArray(this.formGroup);
  }

  get characteristicsFormArray(): FormArray<DocumentCharacteristicsFormGroup> {
    return getCharacteristicsFormArray(this.formGroup);
  }
}
