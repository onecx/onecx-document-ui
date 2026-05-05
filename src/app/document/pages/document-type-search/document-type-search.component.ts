import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  Action,
  BreadcrumbService,
  DataSortDirection,
  InteractiveDataViewComponentState,
  RowListGridData,
  SearchHeaderComponentState,
} from '@onecx/portal-integration-angular';
import { PrimeIcons } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { DocumentType } from 'src/app/shared/generated';
import { DocumentTypeSearchActions } from './document-type-search.actions';
import { selectDocumentTypeSearchViewModel } from './document-type-search.selectors';
import { DocumentTypeSearchViewModel } from './document-type-search.viewmodel';

@Component({
  selector: 'app-document-type-search',
  templateUrl: './document-type-search.component.html',
  styleUrls: ['./document-type-search.component.scss'],
})
export class DocumentTypeSearchComponent implements OnInit {
  viewModel$: Observable<DocumentTypeSearchViewModel>;
  defaultDataSortDirection: DataSortDirection;
  headerActions$: Observable<Action[]>;
  documentTypeFormGroup: FormGroup;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly store: Store,
    private readonly formBuilder: FormBuilder
  ) {
    this.viewModel$ = this.store.select(selectDocumentTypeSearchViewModel);
    this.defaultDataSortDirection = DataSortDirection.NONE;
    this.headerActions$ = this.buildHeaderActions();
    this.documentTypeFormGroup = this.buildFormGroup();
  }

  ngOnInit() {
    this.breadcrumbService.setItems([
      {
        titleKey: 'DOCUMENT_TYPE_SEARCH.BREADCRUMB',
        labelKey: 'DOCUMENT_TYPE_SEARCH.BREADCRUMB',
        routerLink: '/document/document-types',
      },
    ]);
  }

  resultComponentStateChanged(state: InteractiveDataViewComponentState) {
    this.store.dispatch(
      DocumentTypeSearchActions.resultComponentStateChanged(state)
    );
  }

  searchHeaderComponentStateChanged(state: SearchHeaderComponentState) {
    this.store.dispatch(
      DocumentTypeSearchActions.searchHeaderComponentStateChanged(state)
    );
  }

  editItem({ id }: RowListGridData) {
    const documentType = this.getDocumentTypeById(id);
    if (documentType) {
      this.store.dispatch(
        DocumentTypeSearchActions.editDocumentTypeButtonClicked({
          documentType,
        })
      );
    }
  }

  deleteItem({ id }: RowListGridData) {
    this.store.dispatch(
      DocumentTypeSearchActions.deleteDocumentTypeButtonClicked({
        id: String(id),
      })
    );
  }

  openCreateDialog() {
    this.documentTypeFormGroup.reset();
    this.store.dispatch(DocumentTypeSearchActions.createDialogOpened());
  }

  closeDialog() {
    this.documentTypeFormGroup.reset();
    this.store.dispatch(DocumentTypeSearchActions.dialogClosed());
  }

  saveDocumentType(editingDocumentType: DocumentType | null) {
    if (this.documentTypeFormGroup.invalid) {
      return;
    }
    const { name, description, activeStatus } =
      this.documentTypeFormGroup.getRawValue();
    if (editingDocumentType?.id) {
      this.store.dispatch(
        DocumentTypeSearchActions.updateDocumentTypeButtonClicked({
          id: editingDocumentType.id,
          name,
          description,
          activeStatus,
        })
      );
    } else {
      this.store.dispatch(
        DocumentTypeSearchActions.createDocumentTypeButtonClicked({
          name,
          description,
          activeStatus,
        })
      );
    }
    this.documentTypeFormGroup.reset();
  }

  onDialogShow(editingDocumentType: DocumentType | null) {
    this.documentTypeFormGroup.reset({
      name: editingDocumentType?.name ?? '',
      description: editingDocumentType?.description ?? '',
      activeStatus: editingDocumentType?.activeStatus ?? false,
    });
  }

  isFormInvalid(): boolean {
    return this.documentTypeFormGroup.invalid;
  }

  private getDocumentTypeById(id: string | number): DocumentType | undefined {
    let result: DocumentType | undefined;
    this.viewModel$
      .pipe(
        map((vm) => vm.results.find((r) => r.id === id)),
        map((row) =>
          row
            ? ({
                id: String(row.id),
                name: row['name'],
                description: row['description'],
                activeStatus: row['activeStatus'],
              } as DocumentType)
            : undefined
        )
      )
      .subscribe((v) => (result = v))
      .unsubscribe();
    return result;
  }

  private buildHeaderActions(): Observable<Action[]> {
    return this.viewModel$.pipe(
      map(() => [
        {
          labelKey: 'DOCUMENT_TYPE_SEARCH.HEADER_ACTIONS.CREATE',
          icon: PrimeIcons.PLUS,
          titleKey: 'DOCUMENT_TYPE_SEARCH.HEADER_ACTIONS.CREATE',
          show: 'always' as const,
          permission: 'DOCUMENT#WRITE',
          actionCallback: () => this.openCreateDialog(),
        },
      ])
    );
  }

  private buildFormGroup(): FormGroup {
    return this.formBuilder.group({
      name: [null, [Validators.required]],
      description: [null],
      activeStatus: [false],
    });
  }
}
