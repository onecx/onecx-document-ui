import { Component, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  Action,
  BreadcrumbService,
  buildSearchCriteria,
  DataAction,
  DataSortDirection,
  InteractiveDataViewComponentState,
  RowListGridData,
  SearchHeaderComponentState,
  UserService,
} from '@onecx/portal-integration-angular';
import { PrimeIcons, SelectItem } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { LifeCycleState } from 'src/app/shared/generated';
import { DocumentSearchCriteriaComponent } from './components/document-search-criteria/document-search-criteria.component';
import { DocumentSearchActions } from './document-search.actions';
import {
  DocumentSearchCriteriaSchema,
  documentSearchCriteriasSchema,
} from './document-search.parameters';
import { selectDocumentSearchViewModel } from './document-search.selectors';
import { DocumentSearchViewModel } from './document-search.viewmodel';

@Component({
  selector: 'app-document-search',
  templateUrl: './document-search.component.html',
  styleUrls: ['./document-search.component.scss'],
})
export class DocumentSearchComponent implements OnInit {
  @ViewChild(DocumentSearchCriteriaComponent)
  criteriaComponent!: DocumentSearchCriteriaComponent;

  viewModel$: Observable<DocumentSearchViewModel>;
  defaultDataSortDirection: DataSortDirection;
  headerActions$: Observable<Action[]>;
  lifeCycleStates: SelectItem[];
  public documentSearchFormGroup: FormGroup;
  additionalActions: DataAction[] = [];
  deleteEnabled = false;
  public hasEditPermission = false;
  public hasViewPermission = false;

  constructor(
    private readonly breadcrumbService: BreadcrumbService,
    private readonly store: Store,
    private readonly formBuilder: FormBuilder,
    @Inject(LOCALE_ID) public readonly locale: string,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userService: UserService
  ) {
    this.viewModel$ = this.store.select(selectDocumentSearchViewModel);
    this.defaultDataSortDirection = DataSortDirection.NONE;
    this.headerActions$ = this.buildHeaderActions();
    this.lifeCycleStates = this.buildLifeCycleStates();
    this.documentSearchFormGroup = this.buildSearchFormGroup();
    if (this.userService.hasPermission('DOCUMENT#WRITE'))
      this.hasEditPermission = true;
    if (this.userService.hasPermission('DOCUMENT#READ'))
      this.hasViewPermission = true;
  }

  ngOnInit() {
    this.breadcrumbService.setItems([
      {
        titleKey: 'DOCUMENT_SEARCH.BREADCRUMB',
        labelKey: 'DOCUMENT_SEARCH.BREADCRUMB',
        routerLink: '/document',
      },
    ]);
    this.viewModel$.subscribe((vm) => {
      this.documentSearchFormGroup.patchValue(vm.searchCriteria);
    });
    this.prepareAdditionalActions();
  }

  public prepareAdditionalActions(): void {
    if (!this.hasViewPermission) return;
    this.additionalActions = [
      {
        id: 'view',
        labelKey: 'ACTION.VIEW',
        icon: 'pi pi-eye',
        permission: 'DOCUMENT#READ',
        callback: (event) => this.details(event),
      },
      {
        id: 'delete',
        labelKey: 'ACTION.DELETE',
        icon: 'pi pi-trash',
        classes: ['p-button-danger'],
        permission: 'DOCUMENT#DELETE',
        callback: (event) => this.onDelete(event),
      },
    ];
  }

  resultComponentStateChanged(state: InteractiveDataViewComponentState) {
    this.store.dispatch(
      DocumentSearchActions.resultComponentStateChanged(state)
    );
  }

  searchHeaderComponentStateChanged(state: SearchHeaderComponentState) {
    this.store.dispatch(
      DocumentSearchActions.searchHeaderComponentStateChanged(state)
    );
  }

  search(formValue: FormGroup) {
    const searchCriteria = buildSearchCriteria(
      formValue.getRawValue(),
      this.criteriaComponent.calendars,
      { removeNullValues: true }
    );
    this.store.dispatch(
      DocumentSearchActions.searchButtonClicked({ searchCriteria })
    );
  }

  details({ id }: RowListGridData) {
    this.store.dispatch(DocumentSearchActions.detailsButtonClicked({ id }));
  }

  resetSearch() {
    this.documentSearchFormGroup.reset();
    this.store.dispatch(DocumentSearchActions.resetButtonClicked());
  }

  onDelete(data: RowListGridData) {
    this.store.dispatch(
      DocumentSearchActions.deleteButtonClicked({ id: data.id as string })
    );
  }

  quickUpload() {
    this.router.navigate(['quick-upload'], { relativeTo: this.route });
  }

  createNewDocument() {
    this.router.navigate(['create-document'], { relativeTo: this.route });
  }

  exportItems() {
    this.store.dispatch(DocumentSearchActions.exportButtonClicked());
  }

  private buildHeaderActions(): Observable<Action[]> {
    return this.viewModel$.pipe(
      map(() => [
        {
          labelKey: 'DOCUMENT_SEARCH.HEADER_ACTIONS.QUICK_UPLOAD',
          icon: PrimeIcons.UPLOAD,
          titleKey: 'DOCUMENT_SEARCH.HEADER_ACTIONS.QUICK_UPLOAD',
          show: 'always' as const,
          permission: 'DOCUMENT#WRITE',
          actionCallback: () => this.quickUpload(),
        },
        {
          labelKey: 'DOCUMENT_SEARCH.HEADER_ACTIONS.CREATE_NEW_DOCUMENT',
          icon: PrimeIcons.PLUS,
          titleKey: 'DOCUMENT_SEARCH.HEADER_ACTIONS.CREATE_NEW_DOCUMENT',
          show: 'always' as const,
          permission: 'DOCUMENT#WRITE',
          actionCallback: () => this.createNewDocument(),
        },
        {
          labelKey: 'DOCUMENT_SEARCH.HEADER_ACTIONS.EXPORT_ALL',
          icon: PrimeIcons.DOWNLOAD,
          titleKey: 'DOCUMENT_SEARCH.HEADER_ACTIONS.EXPORT_ALL',
          show: 'asOverflow' as const,
          actionCallback: () => this.exportItems(),
        },
      ])
    );
  }

  private buildLifeCycleStates(): SelectItem[] {
    return Object.keys(LifeCycleState).map((key) => ({
      label: key,
      value: LifeCycleState[key as keyof typeof LifeCycleState],
    }));
  }

  private buildSearchFormGroup(): FormGroup {
    return this.formBuilder.group({
      ...(Object.fromEntries(
        documentSearchCriteriasSchema.keyof().options.map((k) => [k, null])
      ) as Record<keyof DocumentSearchCriteriaSchema, unknown>),
    } satisfies Record<keyof DocumentSearchCriteriaSchema, unknown>);
  }
}
