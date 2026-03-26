import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { LetDirective } from '@ngrx/component';
import { ofType } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideUserServiceMock } from '@onecx/angular-integration-interface/mocks';
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
import { DialogService } from 'primeng/dynamicdialog';
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
    searchCriteria: { changeMe: '0' },
    searchExecuted: true,
    results: [],
    searchLoadingIndicator: false,
    diagramComponentState: null,
    resultComponentState: null,
    searchHeaderComponentState: null,
    chartVisible: false,
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
      declarations: [DocumentSearchComponent],
      imports: [
        PortalCoreModule,
        LetDirective,
        ReactiveFormsModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('./../../../../assets/i18n/en.json')
        ).withTranslations('de', require('./../../../../assets/i18n/de.json')),
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        DialogService,
        provideMockStore({
          initialState: { document: { search: initialState } },
        }),
        FormBuilder,
        providePortalDialogService(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideUserServiceMock(),
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

  it('should have 2 overFlow header actions when search config is disabled', async () => {
    const searchHeader = await documentSearch.getHeader();
    const pageHeader = await searchHeader.getPageHeader();
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton();
    await overflowActionButton?.click();

    const overflowMenuItems = await pageHeader.getOverFlowMenuItems();
    expect(overflowMenuItems.length).toBe(2);

    const exportAllActionItem = await pageHeader.getOverFlowMenuItem(
      'Export all'
    );
    expect(await exportAllActionItem!.getText()).toBe('Export all');

    const showHideChartActionItem = await pageHeader.getOverFlowMenuItem(
      'Show chart'
    );
    expect(await showHideChartActionItem!.getText()).toBe('Show chart');
  });

  it('should display hide chart action if chart is visible', async () => {
    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      chartVisible: true,
    });
    store.refreshState();

    const searchHeader = await documentSearch.getHeader();
    const pageHeader = await searchHeader.getPageHeader();
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton();
    await overflowActionButton?.click();

    const overflowMenuItems = await pageHeader.getOverFlowMenuItems();
    expect(overflowMenuItems.length).toBe(2);

    const showHideChartActionItem = await pageHeader.getOverFlowMenuItem(
      'Hide chart'
    );
    expect(await showHideChartActionItem!.getText()).toEqual('Hide chart');
  });

  it('should display chosen column in the diagram', async () => {
    component.diagramColumnId = 'changeMe';
    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      chartVisible: true,
      results: [
        {
          id: '1',
          imagePath: '',
          changeMe: 'val_1',
        },
        {
          id: '2',
          imagePath: '',
          changeMe: 'val_2',
        },
        {
          id: '3',
          imagePath: '',
          changeMe: 'val_2',
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

    const diagram = await (await documentSearch.getDiagram())!.getDiagram();

    expect(await diagram.getTotalNumberOfResults()).toBe(3);
    expect(await diagram.getSumLabel()).toEqual('Total');
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

  it('should dispatch chartVisibilityToggled on show/hide chart header', async () => {
    jest.spyOn(store, 'dispatch');

    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      chartVisible: false,
    });
    store.refreshState();

    const searchHeader = await documentSearch.getHeader();
    const pageHeader = await searchHeader.getPageHeader();
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton();
    await overflowActionButton?.click();

    const showChartActionItem = await pageHeader.getOverFlowMenuItem(
      'Show chart'
    );
    await showChartActionItem!.selectItem();
    expect(store.dispatch).toHaveBeenCalledWith(
      DocumentSearchActions.chartVisibilityToggled()
    );
  });

  it('should display translated headers', async () => {
    const searchHeader = await documentSearch.getHeader();
    const pageHeader = await searchHeader.getPageHeader();
    expect(await pageHeader.getHeaderText()).toEqual('Document Search');
    expect(await pageHeader.getSubheaderText()).toEqual(
      'Searching and displaying of Document'
    );
  });

  it('should display translated empty message when no search results', async () => {
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
    const dataView = await interactiveDataView.getDataView();
    const dataTable = await dataView.getDataListGrid();
    const rows = await dataTable!.getActionButtons('list');
    expect(rows.length).toBe(0);
    expect(
      fixture.debugElement.query(By.css('.p-dataview-emptymessage'))
    ).toBeDefined();
  });

  it('should not display chart when no results or toggled to not visible', async () => {
    component.diagramColumnId = 'changeMe';

    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: [],
      chartVisible: true,
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

    let diagram = await documentSearch.getDiagram();
    expect(diagram).toBeNull();

    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          changeMe: 'val_1',
        },
      ],
      chartVisible: false,
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

    diagram = await documentSearch.getDiagram();
    expect(diagram).toBeNull();

    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          changeMe: 'val_1',
        },
      ],
      chartVisible: true,
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

    diagram = await documentSearch.getDiagram();
    expect(diagram).toBeTruthy();
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
        desc: 'should convert Date values to UTC and dispatch searchButtonClicked',
        formValue: { changeMe: new Date(2024, 4, 15) },
        expected: { changeMe: new Date(Date.UTC(2024, 4, 15)) },
      },
      {
        desc: 'should pass through non-date, non-empty values unchanged',
        formValue: { changeMe: 'testName' },
        expected: { changeMe: 'testName' },
      },
      {
        desc: 'should set searchCriteria property to undefined for null values',
        formValue: { changeMe: null },
        expected: { changeMe: undefined },
      },
    ];

    cases.forEach(({ desc, formValue, expected }) => {
      it(desc, () => {
        jest.spyOn(store, 'dispatch');

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
      {
        method: 'diagramComponentStateChanged',
        action: DocumentSearchActions.diagramComponentStateChanged,
        payload: { label: 'Test Diagram' },
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
  // <<SPEC-EXTENSIONS-MARKER-!!!-DO-NOT-REMOVE-!!!>>
});
