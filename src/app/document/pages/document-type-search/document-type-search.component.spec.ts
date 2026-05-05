import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LetDirective } from '@ngrx/component';
import { Store, StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import {
  provideAppStateServiceMock,
  provideUserServiceMock,
} from '@onecx/angular-integration-interface/mocks';
import {
  BreadcrumbService,
  HAS_PERMISSION_CHECKER,
  InteractiveDataViewComponentState,
  PortalCoreModule,
  providePortalDialogService,
  RowListGridData,
  SearchHeaderComponentState,
  UserService,
} from '@onecx/portal-integration-angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DocumentTypeSearchActions } from './document-type-search.actions';
import { documentTypeSearchColumns } from './document-type-search.columns';
import { DocumentTypeSearchComponent } from './document-type-search.component';
import { initialState } from './document-type-search.reducers';
import { selectDocumentTypeSearchViewModel } from './document-type-search.selectors';
import { DocumentTypeSearchViewModel } from './document-type-search.viewmodel';
import { ActivatedRoute } from '@angular/router';

describe('DocumentTypeSearchComponent', () => {
  let component: DocumentTypeSearchComponent;
  let fixture: ComponentFixture<DocumentTypeSearchComponent>;
  let store: MockStore<Store>;

  const mockDocumentType = {
    id: '1',
    name: 'Invoice',
    description: 'An invoice type',
    activeStatus: true,
  };
  const mockActivatedRoute = {
    snapshot: {
      data: {},
    },
  };
  const baseViewModel: DocumentTypeSearchViewModel = {
    columns: documentTypeSearchColumns,
    results: [],
    loadingIndicator: false,
    resultComponentState: null,
    searchHeaderComponentState: null,
    dialogVisible: false,
    editingDocumentType: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentTypeSearchComponent],
      imports: [
        PortalCoreModule,
        LetDirective,
        ReactiveFormsModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('./../../../../assets/i18n/en.json')
        ).withTranslations('de', require('./../../../../assets/i18n/de.json')),
        NoopAnimationsModule,
        ButtonModule,
        CheckboxModule,
        DialogModule,
        InputTextModule,
        InputTextareaModule,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        DialogService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { document: { documentTypes: initialState } },
        }),
        FormBuilder,
        providePortalDialogService(),
        provideUserServiceMock(),
        provideAppStateServiceMock(),
        {
          provide: HAS_PERMISSION_CHECKER,
          useExisting: UserService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    const translateService = TestBed.inject(TranslateService);
    translateService.use('en');

    store = TestBed.inject(MockStore);
    jest.spyOn(store, 'dispatch');
    store.overrideSelector(selectDocumentTypeSearchViewModel, baseViewModel);
    store.refreshState();

    fixture = TestBed.createComponent(DocumentTypeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set breadcrumb items on init', () => {
    const breadcrumbService = TestBed.inject(BreadcrumbService);
    const spy = jest.spyOn(breadcrumbService, 'setItems');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith([
      {
        titleKey: 'DOCUMENT_TYPE_SEARCH.BREADCRUMB',
        labelKey: 'DOCUMENT_TYPE_SEARCH.BREADCRUMB',
        routerLink: '/document/document-types',
      },
    ]);
  });

  describe('resultComponentStateChanged', () => {
    it('should dispatch resultComponentStateChanged when called', () => {
      const state = { layout: 'table' } as InteractiveDataViewComponentState;
      component.resultComponentStateChanged(state);
      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentTypeSearchActions.resultComponentStateChanged(state)
      );
    });
  });

  describe('searchHeaderComponentStateChanged', () => {
    it('should dispatch searchHeaderComponentStateChanged when called', () => {
      const state = { activeViewMode: 'basic' } as SearchHeaderComponentState;
      component.searchHeaderComponentStateChanged(state);
      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentTypeSearchActions.searchHeaderComponentStateChanged(state)
      );
    });
  });

  describe('editItem', () => {
    it('should dispatch editDocumentTypeButtonClicked when matching document type is found in viewModel', () => {
      const rowData: RowListGridData = {
        id: '1',
        imagePath: '',
        name: 'Invoice',
        description: 'An invoice type',
        activeStatus: true,
      };
      store.overrideSelector(selectDocumentTypeSearchViewModel, {
        ...baseViewModel,
        results: [rowData],
      });
      store.refreshState();
      fixture.detectChanges();

      component.editItem(rowData);

      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentTypeSearchActions.editDocumentTypeButtonClicked({
          documentType: {
            id: '1',
            name: 'Invoice',
            description: 'An invoice type',
            activeStatus: true,
          },
        })
      );
    });

    it('should not dispatch when no matching document type is found', () => {
      store.overrideSelector(selectDocumentTypeSearchViewModel, {
        ...baseViewModel,
        results: [],
      });
      store.refreshState();
      fixture.detectChanges();

      component.editItem({ id: 'nonexistent', imagePath: '' });

      expect(store.dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: DocumentTypeSearchActions.editDocumentTypeButtonClicked.type,
        })
      );
    });
  });

  describe('deleteItem', () => {
    it('should dispatch deleteDocumentTypeButtonClicked with the string id', () => {
      component.deleteItem({ id: '42', imagePath: '' });
      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentTypeSearchActions.deleteDocumentTypeButtonClicked({ id: '42' })
      );
    });
  });

  describe('openCreateDialog', () => {
    it('should dispatch createDialogOpened and reset the form', () => {
      component.documentTypeFormGroup.setValue({
        name: 'Test',
        description: 'Desc',
        activeStatus: true,
      });
      component.openCreateDialog();
      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentTypeSearchActions.createDialogOpened()
      );
      expect(component.documentTypeFormGroup.get('name')?.value).toBeNull();
    });
  });

  describe('closeDialog', () => {
    it('should dispatch dialogClosed and reset the form', () => {
      component.documentTypeFormGroup.setValue({
        name: 'Test',
        description: 'Desc',
        activeStatus: true,
      });
      component.closeDialog();
      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentTypeSearchActions.dialogClosed()
      );
      expect(component.documentTypeFormGroup.get('name')?.value).toBeNull();
    });
  });

  describe('saveDocumentType', () => {
    it('should dispatch createDocumentTypeButtonClicked when form is valid and no editingDocumentType', () => {
      component.documentTypeFormGroup.setValue({
        name: 'New Type',
        description: 'Desc',
        activeStatus: false,
      });
      component.saveDocumentType(null);
      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentTypeSearchActions.createDocumentTypeButtonClicked({
          name: 'New Type',
          description: 'Desc',
          activeStatus: false,
        })
      );
    });

    it('should dispatch updateDocumentTypeButtonClicked when form is valid and editingDocumentType has an id', () => {
      component.documentTypeFormGroup.setValue({
        name: 'Updated',
        description: 'New Desc',
        activeStatus: true,
      });
      component.saveDocumentType(mockDocumentType);
      expect(store.dispatch).toHaveBeenCalledWith(
        DocumentTypeSearchActions.updateDocumentTypeButtonClicked({
          id: '1',
          name: 'Updated',
          description: 'New Desc',
          activeStatus: true,
        })
      );
    });

    it('should reset the form after saving', () => {
      component.documentTypeFormGroup.setValue({
        name: 'New Type',
        description: 'Desc',
        activeStatus: false,
      });
      component.saveDocumentType(null);
      expect(component.documentTypeFormGroup.get('name')?.value).toBeNull();
    });

    it('should not dispatch when form is invalid', () => {
      component.documentTypeFormGroup.reset();
      component.saveDocumentType(null);
      expect(store.dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: DocumentTypeSearchActions.createDocumentTypeButtonClicked.type,
        })
      );
    });
  });

  describe('onDialogShow', () => {
    it('should patch form with editingDocumentType values when provided', () => {
      component.onDialogShow(mockDocumentType);
      expect(component.documentTypeFormGroup.getRawValue()).toEqual({
        name: 'Invoice',
        description: 'An invoice type',
        activeStatus: true,
      });
    });

    it('should patch form with empty defaults when editingDocumentType is null', () => {
      component.onDialogShow(null);
      expect(component.documentTypeFormGroup.getRawValue()).toEqual({
        name: '',
        description: '',
        activeStatus: false,
      });
    });
  });

  describe('isFormInvalid', () => {
    it('should return true when form is invalid', () => {
      component.documentTypeFormGroup.reset();
      expect(component.isFormInvalid()).toBe(true);
    });

    it('should return false when form is valid', () => {
      component.documentTypeFormGroup.setValue({
        name: 'Type',
        description: null,
        activeStatus: false,
      });
      expect(component.isFormInvalid()).toBe(false);
    });
  });

  describe('headerActions$', () => {
    it('should emit a single create action with the correct labelKey and permission', (done) => {
      component.headerActions$.subscribe((actions) => {
        expect(actions).toHaveLength(1);
        expect(actions[0].labelKey).toBe(
          'DOCUMENT_TYPE_SEARCH.HEADER_ACTIONS.CREATE'
        );
        expect(actions[0].permission).toBe('DOCUMENT#WRITE');
        done();
      });
    });

    it('should call openCreateDialog when create action callback is invoked', (done) => {
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      component.headerActions$.subscribe((actions) => {
        (actions[0] as any).actionCallback();
        expect(dispatchSpy).toHaveBeenCalledWith(
          DocumentTypeSearchActions.createDialogOpened()
        );
        done();
      });
    });
  });
});
