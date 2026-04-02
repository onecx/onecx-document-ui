import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { ofType } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import {
  provideAppStateServiceMock,
  provideUserServiceMock,
} from '@onecx/angular-integration-interface/mocks';
import {
  BreadcrumbService,
  ColumnType,
  HAS_PERMISSION_CHECKER,
  PortalCoreModule,
  providePortalDialogService,
  RowListGridData,
  UserService,
} from '@onecx/portal-integration-angular';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { CalendarModule } from 'primeng/calendar';
import { DialogService } from 'primeng/dynamicdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { DocumentSearchCriteriaComponent } from './components/document-search-criteria/document-search-criteria.component';
import { DocumentSearchActions } from './document-search.actions';
import { documentSearchColumns } from './document-search.columns';
import { DocumentSearchComponent } from './document-search.component';
import { DocumentSearchHarness } from './document-search.harness';
import { initialState } from './document-search.reducers';
import { selectDocumentSearchViewModel } from './document-search.selectors';
import { DocumentSearchViewModel } from './document-search.viewmodel';

describe('DocumentSearchComponent', () => {
  const origAddEventListener = window.addEventListener;
  const origPostMessage = window.postMessage;

  let listeners: any[] = [];
  window.addEventListener = (_type: any, listener: any) => {
    listeners.push(listener);
  };

  window.removeEventListener = (_type: any, listener: any) => {
    listeners = listeners.filter((l) => l !== listener);
  };

  window.postMessage = (m: any) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    listeners.forEach((l) =>
      l({
        data: m,
        stopImmediatePropagation: () => {},
        stopPropagation: () => {},
      })
    );
  };

  afterAll(() => {
    window.addEventListener = origAddEventListener;
    window.postMessage = origPostMessage;
  });

  HTMLCanvasElement.prototype.getContext = jest.fn();
  let component: DocumentSearchComponent;
  let fixture: ComponentFixture<DocumentSearchComponent>;
  let store: MockStore<Store>;
  let formBuilder: FormBuilder;
  let documentSearch: DocumentSearchHarness;

  const mockActivatedRoute = {
    snapshot: {
      data: {},
    },
  };
  const baseDocumentSearchViewModel: DocumentSearchViewModel = {
    columns: documentSearchColumns,
    searchCriteria: { name: 'test' },
    searchExecuted: true,
    results: [],
    searchLoadingIndicator: false,
    diagramComponentState: null,
    resultComponentState: null,
    searchHeaderComponentState: null,
    chartVisible: false,
    criteriaOptionsLoaded: false,
    availableDocumentTypes: [],
    avilableChannels: [],
  };

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentSearchComponent, DocumentSearchCriteriaComponent],
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
        CalendarModule,
        DropdownModule,
        InputTextModule,
        MultiSelectModule,
        TooltipModule,
      ],
      providers: [
        DialogService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { document: { search: initialState } },
        }),
        FormBuilder,
        providePortalDialogService(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideUserServiceMock(),
        provideAppStateServiceMock(),
        {
          provide: HAS_PERMISSION_CHECKER,
          useExisting: UserService,
        },
      ],
    }).compileComponents();
  });

  beforeEach(async () => {
    const userService = TestBed.inject(UserService);
    userService.permissions$.next([
      'DOCUMENT#CREATE',
      'DOCUMENT#EDIT',
      'DOCUMENT#DELETE',
      'DOCUMENT#IMPORT',
      'DOCUMENT#EXPORT',
      'DOCUMENT#VIEW',
      'DOCUMENT#SEARCH',
      'DOCUMENT#BACK',
    ]);
    userService.hasPermission = () => true;
    const translateService = TestBed.inject(TranslateService);
    translateService.use('en');
    formBuilder = TestBed.inject(FormBuilder);

    store = TestBed.inject(MockStore);
    jest.spyOn(store, 'dispatch');
    store.overrideSelector(
      selectDocumentSearchViewModel,
      baseDocumentSearchViewModel
    );
    store.refreshState();

    fixture = TestBed.createComponent(DocumentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    documentSearch = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      DocumentSearchHarness
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch resetButtonClicked action on resetSearch', async () => {
    var doneFn = jest.fn();
    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          changeMe: 'val_1',
        },
      ],
      columns: [
        {
          columnType: ColumnType.STRING,
          id: 'changeMe',
          nameKey: 'DOCUMENT_SEARCH.RESULTS.CHANGE_ME',
          filterable: true,
          sortable: true,
          predefinedGroupKeys: [
            'DOCUMENT_SEARCH.PREDEFINED_GROUP.DEFAULT',
            'DOCUMENT_SEARCH.PREDEFINED_GROUP.EXTENDED',
            'DOCUMENT_SEARCH.PREDEFINED_GROUP.FULL',
          ],
        },
      ],
    });
    store.refreshState();

    store.scannedActions$
      .pipe(ofType(DocumentSearchActions.resetButtonClicked))
      .subscribe(() => {
        doneFn();
      });

    const searchHeader = await documentSearch.getHeader();
    await searchHeader.clickResetButton();
    expect(doneFn).toHaveBeenCalledTimes(1);
  });

  it('should have 1 overFlow header action', async () => {
    const searchHeader = await documentSearch.getHeader();
    const pageHeader = await searchHeader.getPageHeader();
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton();
    await overflowActionButton?.click();

    const overflowMenuItems = await pageHeader.getOverFlowMenuItems();
    expect(overflowMenuItems.length).toBe(1);

    const exportAllActionItem = await pageHeader.getOverFlowMenuItem(
      'Export all'
    );
    expect(await exportAllActionItem!.getText()).toBe('Export all');
  });

  it('should display correct breadcrumbs', async () => {
    const breadcrumbService = TestBed.inject(BreadcrumbService);
    jest.spyOn(breadcrumbService, 'setItems');

    component.ngOnInit();
    fixture.detectChanges();

    expect(breadcrumbService.setItems).toHaveBeenCalledTimes(1);
    const searchHeader = await documentSearch.getHeader();
    const pageHeader = await searchHeader.getPageHeader();
    const searchBreadcrumbItem = await pageHeader.getBreadcrumbItem('Search');

    expect(await searchBreadcrumbItem!.getText()).toEqual('Search');
  });

  it('should dispatch displayedColumnsChanged on data view column change', async () => {
    jest.spyOn(store, 'dispatch');
    const columns = [
      {
        columnType: ColumnType.STRING,
        id: 'changeMe',
        nameKey: 'DOCUMENT_SEARCH.RESULTS.CHANGE_ME',
        filterable: true,
        sortable: true,
        predefinedGroupKeys: [
          'DOCUMENT_SEARCH.PREDEFINED_GROUP.DEFAULT',
          'DOCUMENT_SEARCH.PREDEFINED_GROUP.EXTENDED',
          'DOCUMENT_SEARCH.PREDEFINED_GROUP.FULL',
        ],
      },
    ];
    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: [],
      columns: columns,
      displayedColumns: columns,
    });
    store.refreshState();

    const interactiveDataView = await documentSearch.getSearchResults();
    (
      await (
        await interactiveDataView.getDataLayoutSelection()
      ).getTableLayoutSelectionButton()
    )?.click();

    const columnGroupSelector =
      await interactiveDataView?.getCustomGroupColumnSelector();
    expect(columnGroupSelector).toBeTruthy();

    await columnGroupSelector!.openCustomGroupColumnSelectorDialog();
    const pickList = await columnGroupSelector!.getPicklist();
    const transferControlButtons = await pickList.getTransferControlsButtons();
    expect(transferControlButtons.length).toBe(4);

    // Currently, all columns are selected. Next, we are unselecting all to have a clean test setting.
    const deactivateAllColumnsButton = transferControlButtons[1];
    await deactivateAllColumnsButton.click();
    const inactiveItems = await pickList.getTargetListItems();
    await inactiveItems[0].selectItem();
    const activateCurrentColumnButton = transferControlButtons[2];
    await activateCurrentColumnButton.click();
    const saveButton = await columnGroupSelector!.getSaveButton();
    await saveButton.click();

    expect(store.dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({ displayedColumns: columns })
    );
  });

  it('should export csv data on export action click', async () => {
    jest.spyOn(store, 'dispatch');

    const results = [
      {
        id: '1',
        imagePath: '',
        changeMe: 'val_1',
      },
    ];
    const columns = [
      {
        columnType: ColumnType.STRING,
        id: 'changeMe',
        nameKey: 'DOCUMENT_SEARCH.RESULTS.CHANGE_ME',
        filterable: true,
        sortable: true,
        predefinedGroupKeys: [
          'DOCUMENT_SEARCH.PREDEFINED_GROUP.DEFAULT',
          'DOCUMENT_SEARCH.PREDEFINED_GROUP.EXTENDED',
          'DOCUMENT_SEARCH.PREDEFINED_GROUP.FULL',
        ],
      },
    ];
    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: results,
      columns: columns,
      displayedColumns: columns,
    });
    store.refreshState();

    const searchHeader = await documentSearch.getHeader();
    const pageHeader = await searchHeader.getPageHeader();
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton();
    await overflowActionButton?.click();

    const exportAllActionItem = await pageHeader.getOverFlowMenuItem(
      'Export all'
    );
    await exportAllActionItem!.selectItem();

    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentSearchActions.exportButtonClicked()
    );
  });

  describe('searchCriteria mapping', () => {
    const cases = [
      {
        desc: 'should pass through non-null string values unchanged',
        formValue: { name: 'testName' },
        expected: { name: 'testName' },
      },
      {
        desc: 'should strip null values from dispatched searchCriteria',
        formValue: { name: null },
        expected: { name: undefined },
      },
    ];

    cases.forEach(({ desc, formValue, expected }) => {
      it(desc, () => {
        jest.spyOn(store, 'dispatch');

        component.criteriaComponent = {
          calendars: { toArray: () => [] },
        } as any;
        component.documentSearchFormGroup = {
          value: formValue,
          getRawValue: () => formValue,
        } as any;

        component.search(component.documentSearchFormGroup);

        const calls = (store.dispatch as jest.Mock).mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const lastAction = calls[calls.length - 1][0];
        expect(lastAction.type).toBe(
          DocumentSearchActions.searchButtonClicked.type
        );
        expect(lastAction.searchCriteria).toEqual(expected);
      });
    });
  });

  describe('actions dispatch', () => {
    const cases = [
      {
        method: 'resultComponentStateChanged',
        action: DocumentSearchActions.resultComponentStateChanged,
        payload: { groupKey: 'test-group' },
      },
      {
        method: 'searchHeaderComponentStateChanged',
        action: DocumentSearchActions.searchHeaderComponentStateChanged,
        payload: {
          activeViewMode: 'basic' as 'basic',
          selectedSearchConfig: 'config1',
        },
      },
    ];

    cases.forEach(({ method, action, payload }) => {
      it(`should dispatch ${action.type} when ${method} is called`, () => {
        jest.spyOn(store, 'dispatch');
        (component as any)[method](payload);
        expect(store.dispatch).toHaveBeenCalledWith(action(payload));
      });
    });
  });

  it('should dispatch detailsButtonClicked action on details', () => {
    jest.spyOn(store, 'dispatch');
    const row: RowListGridData = { id: 'test-id', imagePath: '' } as any;
    component.details(row);
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentSearchActions.detailsButtonClicked({ id: 'test-id' })
    );
  });

  it('should dispatch resetButtonClicked and reset form on resetSearch', () => {
    jest.spyOn(store, 'dispatch');
    component.documentSearchFormGroup.patchValue({ name: 'something' });
    component.resetSearch();
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentSearchActions.resetButtonClicked()
    );
    expect(component.documentSearchFormGroup.value.name).toBeNull();
  });

  it('should dispatch exportButtonClicked when exportItems is called', () => {
    jest.spyOn(store, 'dispatch');
    component.exportItems();
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentSearchActions.exportButtonClicked()
    );
  });

  it('should navigate to quick-upload on quickUpload', () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    component.quickUpload();
    expect(router.navigate).toHaveBeenCalledWith(
      ['quick-upload'],
      expect.objectContaining({ relativeTo: expect.anything() })
    );
  });

  it('should navigate to create-document on createNewDocument', () => {
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    component.createNewDocument();
    expect(router.navigate).toHaveBeenCalledWith(
      ['create-document'],
      expect.objectContaining({ relativeTo: expect.anything() })
    );
  });

  describe('buildHeaderActions', () => {
    it('should emit 3 header actions: quickUpload, createNewDocument, exportAll', (done) => {
      component.headerActions$.subscribe((actions) => {
        expect(actions.length).toBe(3);
        done();
      });
    });

    it('should set quickUpload action as show=always with DOCUMENT#WRITE permission', (done) => {
      component.headerActions$.subscribe((actions) => {
        const action = actions[0];
        expect(action.show).toBe('always');
        expect(action.permission).toBe('DOCUMENT#WRITE');
        done();
      });
    });

    it('should set exportAll action as show=asOverflow', (done) => {
      component.headerActions$.subscribe((actions) => {
        const exportAction = actions[2];
        expect(exportAction.show).toBe('asOverflow');
        done();
      });
    });
  });

  describe('buildLifeCycleStates', () => {
    it('should build SelectItem[] from LifeCycleState enum keys', () => {
      const states = component.lifeCycleStates;
      expect(states.length).toBeGreaterThan(0);
      states.forEach((item) => {
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('value');
        expect(item.label).toBe(item.value);
      });
    });

    it('should include Draft, Review, Released, Archived state keys', () => {
      const values = component.lifeCycleStates.map((s) => s.value);
      expect(values).toContain('Draft');
      expect(values).toContain('Review');
      expect(values).toContain('Released');
      expect(values).toContain('Archived');
    });
  });

  describe('buildSearchFormGroup', () => {
    it('should build form group with all keys from documentSearchCriteriasSchema', () => {
      const {
        documentSearchCriteriasSchema,
      } = require('./document-search.parameters');
      const schemaKeys = documentSearchCriteriasSchema.keyof().options;
      const formKeys = Object.keys(component.documentSearchFormGroup.controls);
      schemaKeys.forEach((key: string) => {
        expect(formKeys).toContain(key);
      });
    });

    it('should initialize all form controls to null before viewModel patchValue', () => {
      // Create a fresh component without store subscription interference
      const freshFixture = TestBed.createComponent(DocumentSearchComponent);
      const freshComponent = freshFixture.componentInstance;
      // Before detectChanges the form is built but store subscription hasn't patched values yet
      const values = freshComponent.documentSearchFormGroup.getRawValue();
      Object.values(values).forEach((val) => {
        expect(val).toBeNull();
      });
    });
  });
  // <<SPEC-EXTENSIONS-MARKER-!!!-DO-NOT-REMOVE-!!!>>

  describe('headerActions$ callbacks', () => {
    it('should navigate to quick-upload when quickUpload action callback is invoked', (done) => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');

      component.headerActions$.subscribe((actions) => {
        actions[0].actionCallback!();
        expect(router.navigate).toHaveBeenCalledWith(
          ['quick-upload'],
          expect.objectContaining({ relativeTo: expect.anything() })
        );
        done();
      });
    });

    it('should navigate to create-document when createNewDocument action callback is invoked', (done) => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');

      component.headerActions$.subscribe((actions) => {
        actions[1].actionCallback!();
        expect(router.navigate).toHaveBeenCalledWith(
          ['create-document'],
          expect.objectContaining({ relativeTo: expect.anything() })
        );
        done();
      });
    });
  });
});
