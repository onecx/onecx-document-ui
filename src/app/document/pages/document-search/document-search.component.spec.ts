import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute, Router } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { ofType } from '@ngrx/effects'
import { Store, StoreModule } from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { TranslateService } from '@ngx-translate/core'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { firstValueFrom } from 'rxjs'

import { DatePickerModule } from 'primeng/datepicker'
import { SelectModule } from 'primeng/select'
import { InputTextModule } from 'primeng/inputtext'
import { MultiSelectModule } from 'primeng/multiselect'
import { TooltipModule } from 'primeng/tooltip'

import { provideAppStateServiceMock, provideUserServiceMock } from '@onecx/angular-integration-interface/mocks'
import {
  AngularAcceleratorModule,
  ColumnType,
  InteractiveDataViewComponentState,
  providePortalDialogService,
  RowListGridData
} from '@onecx/angular-accelerator'
import { AlwaysGrantPermissionChecker, HAS_PERMISSION_CHECKER, providePermissionService } from '@onecx/angular-utils'
import { UserService } from '@onecx/angular-integration-interface'

import { DocumentSearchCriteriaComponent } from './components/document-search-criteria/document-search-criteria.component'
import { DocumentSearchActions } from './document-search.actions'
import { documentSearchColumns } from './document-search.columns'
import { DocumentSearchComponent } from './document-search.component'
import { initialState } from './document-search.reducers'
import { selectDocumentSearchViewModel } from './document-search.selectors'
import { DocumentSearchViewModel } from './document-search.viewmodel'
import { documentSearchCriteriasSchema } from './document-search.parameters'

describe('DocumentSearchComponent', () => {
  const origAddEventListener = window.addEventListener
  const origPostMessage = window.postMessage

  let listeners: any[] = []
  window.addEventListener = (_type: any, listener: any) => {
    listeners.push(listener)
  }

  window.removeEventListener = (_type: any, listener: any) => {
    listeners = listeners.filter((l) => l !== listener)
  }

  window.postMessage = (m: any) => {
    listeners.forEach((l) =>
      l({
        data: m
        //stopImmediatePropagation: () => {},
        //stopPropagation: () => {},
      })
    )
  }

  afterAll(() => {
    window.addEventListener = origAddEventListener
    window.postMessage = origPostMessage
  })

  HTMLCanvasElement.prototype.getContext = jest.fn()
  let component: DocumentSearchComponent
  let fixture: ComponentFixture<DocumentSearchComponent>
  let store: MockStore<Store>

  const mockActivatedRoute = {
    snapshot: {
      data: {}
    }
  }
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
    avilableChannels: []
  }

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
        dispatchEvent: jest.fn()
      }))
    })
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DocumentSearchComponent,
        DocumentSearchCriteriaComponent,
        AngularAcceleratorModule,
        LetDirective,
        ReactiveFormsModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations({
          de: require('./src/assets/i18n/de.json'),
          en: require('./src/assets/i18n/en.json')
        }).withDefaultLanguage('en'),
        NoopAnimationsModule,
        DatePickerModule,
        SelectModule,
        InputTextModule,
        MultiSelectModule,
        TooltipModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        providePermissionService(),
        provideMockStore({
          initialState: { document: { search: initialState } }
        }),
        providePortalDialogService(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideUserServiceMock(),
        provideAppStateServiceMock(),
        {
          provide: HAS_PERMISSION_CHECKER,
          useClass: AlwaysGrantPermissionChecker
        }
      ]
    }).compileComponents()
  })

  beforeEach(async () => {
    const userService = TestBed.inject(UserService)
    jest.spyOn(userService, 'hasPermission').mockResolvedValue(true)
    const translateService = TestBed.inject(TranslateService)
    translateService.use('en')

    store = TestBed.inject(MockStore)
    jest.spyOn(store, 'dispatch')
    store.overrideSelector(selectDocumentSearchViewModel, baseDocumentSearchViewModel)
    store.refreshState()

    fixture = TestBed.createComponent(DocumentSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    await fixture.whenStable()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should dispatch resetButtonClicked action on resetSearch', async () => {
    const doneFn = jest.fn()
    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          changeMe: 'val_1'
        }
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
            'DOCUMENT_SEARCH.PREDEFINED_GROUP.FULL'
          ]
        }
      ]
    })
    store.refreshState()

    store.scannedActions$.pipe(ofType(DocumentSearchActions.resetButtonClicked)).subscribe(() => {
      doneFn()
    })

    component.resetSearch()
    expect(doneFn).toHaveBeenCalledTimes(1)
  })

  it('should have 2 overFlow header action', async () => {
    const actions = await firstValueFrom(component.headerActions$)
    const overflowActions = actions.filter((action) => action.show === 'asOverflow')

    expect(overflowActions).toHaveLength(2)
    expect(
      overflowActions.some((action) => action.labelKey === 'DOCUMENT_SEARCH.HEADER_ACTIONS.EXPORT_ALL')
    ).toBeTruthy()
    expect(
      overflowActions.some((action) => action.labelKey === 'DOCUMENT_SEARCH.HEADER_ACTIONS.NAVIGATE_TO_TYPES')
    ).toBeTruthy()
  })

  it('should display correct breadcrumbs', async () => {
    const breadcrumbService = component['breadcrumbService']
    jest.spyOn(breadcrumbService, 'setItems')

    component.ngOnInit()
    fixture.detectChanges()

    expect(breadcrumbService.setItems).toHaveBeenCalledTimes(1)
    expect(breadcrumbService.setItems).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          labelKey: 'DOCUMENT_SEARCH.BREADCRUMB',
          titleKey: 'DOCUMENT_SEARCH.BREADCRUMB'
        })
      ])
    )
  })

  it('should dispatch displayedColumnsChanged on data view column change', async () => {
    jest.spyOn(store, 'dispatch')
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
          'DOCUMENT_SEARCH.PREDEFINED_GROUP.FULL'
        ]
      }
    ]
    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: [],
      columns: columns,
      displayedColumns: columns
    })
    store.refreshState()

    const state = {
      activePage: 0,
      pageSize: 10,
      filters: [],
      sorting: { sortColumn: '', sortDirection: 'NONE' },
      selectedRows: []
    } as InteractiveDataViewComponentState

    component.resultComponentStateChanged(state)

    expect(store.dispatch).toHaveBeenCalledWith(DocumentSearchActions.resultComponentStateChanged(state))
  })

  it('should export csv data on export action click', async () => {
    jest.spyOn(store, 'dispatch')

    const results = [
      {
        id: '1',
        imagePath: '',
        changeMe: 'val_1'
      }
    ]
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
          'DOCUMENT_SEARCH.PREDEFINED_GROUP.FULL'
        ]
      }
    ]
    store.overrideSelector(selectDocumentSearchViewModel, {
      ...baseDocumentSearchViewModel,
      results: results,
      columns: columns,
      displayedColumns: columns
    })
    store.refreshState()

    const actions = await firstValueFrom(component.headerActions$)
    const exportAction = actions.find((action) => action.labelKey === 'DOCUMENT_SEARCH.HEADER_ACTIONS.EXPORT_ALL')

    expect(exportAction).toBeTruthy()
    if (typeof (exportAction as any)?.actionCallback === 'function') {
      ;(exportAction as any).actionCallback()
    } else {
      throw new Error('Export action does not have a callable handler')
    }

    expect(store.dispatch).toHaveBeenCalledWith(DocumentSearchActions.exportButtonClicked())
  })

  describe('searchCriteria mapping', () => {
    const cases = [
      {
        desc: 'should pass through non-null string values unchanged',
        formValue: { name: 'testName' },
        expected: { name: 'testName' }
      },
      {
        desc: 'should strip null values from dispatched searchCriteria',
        formValue: { name: null },
        expected: { name: undefined }
      }
    ]

    cases.forEach(({ desc, formValue, expected }) => {
      it(desc, () => {
        jest.spyOn(store, 'dispatch')

        component.criteriaComponent = {
          calendars: { toArray: () => [] }
        } as any
        component.documentSearchFormGroup = {
          value: formValue,
          getRawValue: () => formValue
        } as any

        component.search(component.documentSearchFormGroup)

        const calls = (store.dispatch as jest.Mock).mock.calls
        expect(calls.length).toBeGreaterThan(0)
        const lastAction = calls[calls.length - 1][0]
        expect(lastAction.type).toBe(DocumentSearchActions.searchButtonClicked.type)
        expect(lastAction.searchCriteria).toEqual(expected)
      })
    })
  })

  describe('actions dispatch', () => {
    const cases = [
      {
        method: 'resultComponentStateChanged',
        action: DocumentSearchActions.resultComponentStateChanged,
        payload: { activeColumnGroupKey: 'test-group' } as InteractiveDataViewComponentState
      },
      {
        method: 'searchHeaderComponentStateChanged',
        action: DocumentSearchActions.searchHeaderComponentStateChanged,
        payload: {
          activeViewMode: 'basic',
          selectedSearchConfig: 'config1'
        } as InteractiveDataViewComponentState
      }
    ]

    cases.forEach(({ method, action, payload }) => {
      it(`should dispatch ${action.type} when ${method} is called`, () => {
        jest.spyOn(store, 'dispatch')
        ;(component as any)[method](payload)
        //props: ColumnGroupSelectionComponentState & CustomGroupColumnSelectorComponentState & DataLayoutSelectionComponentState & DataListGridSortingComponentState & DataListGridComponentState & DataTableComponentState & FilterViewComponentState & SearchHeaderComponentState)
        expect(store.dispatch).toHaveBeenCalledWith(action(payload))
      })
    })
  })

  it('should dispatch detailsButtonClicked action on details', () => {
    jest.spyOn(store, 'dispatch')
    const row: RowListGridData = { id: 'test-id', imagePath: '' } as any
    component.details(row)
    expect(store.dispatch).toHaveBeenCalledWith(DocumentSearchActions.detailsButtonClicked({ id: 'test-id' }))
  })

  it('should dispatch resetButtonClicked and reset form on resetSearch', () => {
    jest.spyOn(store, 'dispatch')
    component.documentSearchFormGroup.patchValue({ name: 'something' })
    component.resetSearch()
    expect(store.dispatch).toHaveBeenCalledWith(DocumentSearchActions.resetButtonClicked())
    expect(component.documentSearchFormGroup.value.name).toBeNull()
  })

  it('should dispatch exportButtonClicked when exportItems is called', () => {
    jest.spyOn(store, 'dispatch')
    component.exportItems()
    expect(store.dispatch).toHaveBeenCalledWith(DocumentSearchActions.exportButtonClicked())
  })

  it('should navigate to quick-upload on quickUpload', () => {
    const router = TestBed.inject(Router)
    jest.spyOn(router, 'navigate')
    component.quickUpload()
    expect(router.navigate).toHaveBeenCalledWith(
      ['quick-upload'],
      expect.objectContaining({ relativeTo: expect.anything() })
    )
  })

  it('should navigate to create-document on createNewDocument', () => {
    const router = TestBed.inject(Router)
    jest.spyOn(router, 'navigate')
    component.createNewDocument()
    expect(router.navigate).toHaveBeenCalledWith(
      ['create-document'],
      expect.objectContaining({ relativeTo: expect.anything() })
    )
  })

  describe('buildHeaderActions', () => {
    it('should emit 4 header actions: quickUpload, createNewDocument, exportAll', (done) => {
      component.headerActions$.subscribe((actions) => {
        expect(actions).toHaveLength(4)
        done()
      })
    })

    it('should set quickUpload action as show=always with DOCUMENT#CREATE permission', (done) => {
      component.headerActions$.subscribe((actions) => {
        const action = actions[0]
        expect(action.show).toBe('always')
        expect(action.permission).toBe('DOCUMENT#CREATE')
        done()
      })
    })

    it('should set exportAll action as show=asOverflow', (done) => {
      component.headerActions$.subscribe((actions) => {
        const exportAction = actions[2]
        expect(exportAction.show).toBe('asOverflow')
        done()
      })
    })
  })

  describe('buildLifeCycleStates', () => {
    it('should build SelectItem[] with label as enum key name and value as enum value', () => {
      const states = component.lifeCycleStates
      expect(states.length).toBeGreaterThan(0)
      states.forEach((item) => {
        expect(item).toHaveProperty('label')
        expect(item).toHaveProperty('value')
        expect(item.value).toBe(item.value.toUpperCase())
      })
    })

    it('should include DRAFT, REVIEW, RELEASED, ARCHIVED as values', () => {
      const values = component.lifeCycleStates.map((s) => s.value)
      expect(values).toContain('DRAFT')
      expect(values).toContain('REVIEW')
      expect(values).toContain('RELEASED')
      expect(values).toContain('ARCHIVED')
    })
  })

  describe('buildSearchFormGroup', () => {
    it('should build form group with all keys from documentSearchCriteriasSchema', () => {
      const schemaKeys = documentSearchCriteriasSchema.keyof().options
      const formKeys = Object.keys(component.documentSearchFormGroup.controls)
      schemaKeys.forEach((key: string) => {
        expect(formKeys).toContain(key)
      })
    })

    it('should initialize all form controls to null before viewModel patchValue', () => {
      // Create a fresh component without store subscription interference
      const freshFixture = TestBed.createComponent(DocumentSearchComponent)
      const freshComponent = freshFixture.componentInstance
      // Before detectChanges the form is built but store subscription hasn't patched values yet
      const values = freshComponent.documentSearchFormGroup.getRawValue()
      Object.values(values).forEach((val) => {
        expect(val).toBeNull()
      })
    })
  })
  // <<SPEC-EXTENSIONS-MARKER-!!!-DO-NOT-REMOVE-!!!>>

  describe('prepareAdditionalActions', () => {
    it('should set additionalActions to empty and return early when hasViewPermission is false', () => {
      component.hasViewPermission = false
      component.additionalActions = []
      component.prepareAdditionalActions()
      expect(component.additionalActions).toEqual([])
    })

    it('should set two additionalActions when hasViewPermission is true', () => {
      component.hasViewPermission = true
      component.prepareAdditionalActions()
      expect(component.additionalActions).toHaveLength(2)
    })

    it('should set the view action with DOCUMENT#VIEW permission', () => {
      component.hasViewPermission = true
      component.prepareAdditionalActions()
      const viewAction = component.additionalActions[0]
      expect(viewAction.permission).toBe('DOCUMENT#VIEW')
    })

    it('should set the delete action with DOCUMENT#DELETE permission and danger class', () => {
      component.hasViewPermission = true
      component.prepareAdditionalActions()
      const deleteAction = component.additionalActions[1]
      expect(deleteAction.permission).toBe('DOCUMENT#DELETE')
      expect(deleteAction.classes).toContain('p-button-danger')
    })

    it('should dispatch detailsButtonClicked when view action callback is invoked', () => {
      component.hasViewPermission = true
      component.prepareAdditionalActions()
      const viewAction = component.additionalActions[0]
      const row: RowListGridData = { id: 'row-1', imagePath: '' }
      if (viewAction.callback) viewAction.callback(row)
      expect(store.dispatch).toHaveBeenCalledWith(DocumentSearchActions.detailsButtonClicked({ id: 'row-1' }))
    })

    it('should dispatch deleteButtonClicked when delete action callback is invoked', () => {
      component.hasViewPermission = true
      component.prepareAdditionalActions()
      const deleteAction = component.additionalActions[1]
      const row: RowListGridData = { id: 'row-2', imagePath: '' }
      if (deleteAction.callback) deleteAction.callback(row)
      expect(store.dispatch).toHaveBeenCalledWith(DocumentSearchActions.deleteButtonClicked({ id: 'row-2' }))
    })
  })

  describe('headerActions$ callbacks', () => {
    it('should navigate to quick-upload when quickUpload action callback is invoked', (done) => {
      const router = TestBed.inject(Router)
      jest.spyOn(router, 'navigate')

      component.headerActions$.subscribe((actions) => {
        actions[0].actionCallback!()
        expect(router.navigate).toHaveBeenCalledWith(
          ['quick-upload'],
          expect.objectContaining({ relativeTo: expect.anything() })
        )
        done()
      })
    })

    it('should navigate to create-document when createNewDocument action callback is invoked', (done) => {
      const router = TestBed.inject(Router)
      jest.spyOn(router, 'navigate')

      component.headerActions$.subscribe((actions) => {
        actions[1].actionCallback!()
        expect(router.navigate).toHaveBeenCalledWith(
          ['create-document'],
          expect.objectContaining({ relativeTo: expect.anything() })
        )
        done()
      })
    })

    it('should dispatch navigateToTypesButtonClicked when navigateToTypes action callback is invoked', (done) => {
      component.headerActions$.subscribe((actions) => {
        actions[2].actionCallback?.()
        expect(store.dispatch).toHaveBeenCalledWith(DocumentSearchActions.navigateToTypesButtonClicked())
        done()
      })
    })
  })
})
