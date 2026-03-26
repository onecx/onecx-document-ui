import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  Action,
  BreadcrumbService,
} from '@onecx/portal-integration-angular';
import { map, Observable, Subscription } from 'rxjs';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimeIcons, SelectItem } from 'primeng/api';
import { DocumentDetailsActions } from './document-details.actions';
import {
  selectDocumentDetailsViewModel,
  selectDocumentTypes,
} from './document-details.selectors';
import { DocumentDetailsViewModel } from './document-details.viewmodel';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss'],
})
export class DocumentDetailsComponent implements OnInit {
  viewModel$: Observable<DocumentDetailsViewModel>;

  headerActions$!: Observable<Action[]>;

  public formGroup!: FormGroup;

  private sub = new Subscription();

  constructor(
    private store: Store,
    private breadcrumbService: BreadcrumbService
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
        details: this.formGroup.value,
      })
    );
  }

  delete() {
    this.store.dispatch(DocumentDetailsActions.deleteButtonClicked());
  }

  private makeSubscriptions() {
    this.sub.add(this.viewModel$.subscribe((vm) => this.updateFormValue(vm)));
  }

  private setForm() {
    this.formGroup = new FormGroup({
      id: new FormControl(null, [Validators.maxLength(255)]),
      name: new FormControl(null, [Validators.maxLength(255)]),
      type: new FormControl(null),
      version: new FormControl(null, [Validators.maxLength(255)]),
      channel: new FormControl(null),
      specification: new FormControl(null),
      status: new FormControl(null),
      description: new FormControl(null, [Validators.maxLength(4000)]),
      involvement: new FormControl(null, [Validators.maxLength(255)]),
      objectReferenceType: new FormControl(null, [Validators.maxLength(255)]),
      objectReferenceId: new FormControl(null, [Validators.maxLength(255)]),
    });
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
            permission: 'DOCUMENT#BACK',
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
          {
            titleKey: 'DOCUMENT_DETAILS.GENERAL.MORE',
            icon: PrimeIcons.ELLIPSIS_V,
            show: 'always',
            btnClass: '',
            actionCallback: () => {
              // TODO: add callback
            },
          },
        ];
        return actions;
      })
    );
  }

  private updateFormValue(vm: DocumentDetailsViewModel) {
    if (!vm.editMode) {
      this.formGroup.patchValue({
        id: vm.details?.id,
        name: vm.details?.name,
        type: vm.details?.type?.id,
        version: vm.details?.documentVersion,
        channel: vm.details?.channel?.name,
        specification: vm.details?.specification?.id,
        status: vm.details?.lifeCycleState,
        description: vm.details?.description,
        involvement: vm.details?.relatedObject?.involvement,
        objectReferenceType: vm.details?.relatedObject?.objectReferenceType,
        objectReferenceId: vm.details?.relatedObject?.objectReferenceId,
      });
      this.formGroup.markAsPristine();
    }

    if (vm.editMode) {
      this.formGroup.enable();
    } else {
      this.formGroup.disable();
    }
  }

  get documentTypes$(): Observable<SelectItem[]> {
    return this.store.select(selectDocumentTypes);
  }
}
