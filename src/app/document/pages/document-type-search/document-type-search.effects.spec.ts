import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { provideRouter } from '@angular/router'
import { provideMockActions } from '@ngrx/effects/testing'
import { routerNavigatedAction } from '@ngrx/router-store'
import { Action } from '@ngrx/store'
import { provideMockStore } from '@ngrx/store/testing'
import { AppStateService } from '@onecx/angular-integration-interface'
import { provideAppStateServiceMock } from '@onecx/angular-integration-interface/mocks'
import { PortalMessageService } from '@onecx/portal-integration-angular'
import { of, ReplaySubject, throwError } from 'rxjs'
import { take } from 'rxjs/operators'
import { DocumentTypeControllerAPIService } from 'src/app/shared/generated'
import { DocumentTypeSearchActions } from './document-type-search.actions'
import { DocumentTypeSearchEffects } from './document-type-search.effects'

jest.mock('@onecx/ngrx-accelerator', () => {
  const actual = jest.requireActual('@onecx/ngrx-accelerator')
  return {
    ...actual,
    filterForNavigatedTo: () => (source: any) => source
  }
})

describe('DocumentTypeSearchEffects', () => {
  let actions$: ReplaySubject<Action>
  let effects: DocumentTypeSearchEffects
  let documentTypeService: jest.Mocked<DocumentTypeControllerAPIService>
  let messageService: jest.Mocked<PortalMessageService>
  let router: jest.Mocked<Router>

  const mockDocumentType = {
    id: '1',
    name: 'Invoice',
    description: 'Desc',
    activeStatus: true
  }

  beforeEach(async () => {
    actions$ = new ReplaySubject(1)

    documentTypeService = {
      getAllTypesOfDocument: jest.fn(),
      createDocumentType: jest.fn(),
      updateDocumentTypeById: jest.fn(),
      deleteDocumentTypeById: jest.fn()
    } as unknown as jest.Mocked<DocumentTypeControllerAPIService>

    messageService = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<PortalMessageService>

    router = {
      navigate: jest.fn(),
      events: of()
    } as unknown as jest.Mocked<Router>

    await TestBed.configureTestingModule({
      providers: [
        DocumentTypeSearchEffects,
        provideRouter([]),
        provideMockStore({}),
        provideMockActions(() => actions$),
        provideAppStateServiceMock(),
        { provide: Router, useValue: router },
        { provide: DocumentTypeControllerAPIService, useValue: documentTypeService },
        { provide: PortalMessageService, useValue: messageService }
      ]
    }).compileComponents()

    effects = TestBed.inject(DocumentTypeSearchEffects)
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('loadOnNavigation$', () => {
    it('should dispatch loadDocumentTypesTriggered when navigated to the page', (done) => {
      effects.loadOnNavigation$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(DocumentTypeSearchActions.loadDocumentTypesTriggered())
        done()
      })

      actions$.next(
        routerNavigatedAction({
          payload: {
            routerState: { url: '/document-types' },
            event: {}
          } as any
        })
      )
    })
  })

  describe('loadDocumentTypes$', () => {
    it('should dispatch documentTypesReceived when API succeeds', (done) => {
      documentTypeService.getAllTypesOfDocument.mockReturnValue(of([mockDocumentType]) as any)

      effects.loadDocumentTypes$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentTypeSearchActions.documentTypesReceived({
            documentTypes: [mockDocumentType]
          })
        )
        done()
      })

      actions$.next(DocumentTypeSearchActions.loadDocumentTypesTriggered())
    })

    it('should dispatch documentTypesLoadingFailed when API fails', (done) => {
      documentTypeService.getAllTypesOfDocument.mockReturnValue(throwError(() => ({ error: 'load error' })))

      effects.loadDocumentTypes$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentTypeSearchActions.documentTypesLoadingFailed({
            error: 'load error'
          })
        )
        done()
      })

      actions$.next(DocumentTypeSearchActions.loadDocumentTypesTriggered())
    })
  })

  describe('createDocumentType$', () => {
    it('should dispatch documentTypeCreated when API succeeds', (done) => {
      documentTypeService.createDocumentType.mockReturnValue(of(mockDocumentType) as any)

      effects.createDocumentType$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentTypeSearchActions.documentTypeCreated({
            documentType: mockDocumentType
          })
        )
        done()
      })

      actions$.next(
        DocumentTypeSearchActions.createDocumentTypeButtonClicked({
          name: 'Invoice',
          description: 'Desc',
          activeStatus: true
        })
      )
    })

    it('should dispatch documentTypeCreationFailed when API fails', (done) => {
      documentTypeService.createDocumentType.mockReturnValue(throwError(() => ({ error: 'create error' })))

      effects.createDocumentType$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentTypeSearchActions.documentTypeCreationFailed({
            error: 'create error'
          })
        )
        done()
      })

      actions$.next(
        DocumentTypeSearchActions.createDocumentTypeButtonClicked({
          name: 'Invoice'
        })
      )
    })
  })

  describe('updateDocumentType$', () => {
    it('should dispatch documentTypeUpdated when API succeeds', (done) => {
      const updated = { ...mockDocumentType, name: 'Updated' }
      documentTypeService.updateDocumentTypeById.mockReturnValue(of(updated) as any)

      effects.updateDocumentType$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentTypeSearchActions.documentTypeUpdated({
            documentType: updated
          })
        )
        done()
      })

      actions$.next(
        DocumentTypeSearchActions.updateDocumentTypeButtonClicked({
          id: '1',
          name: 'Updated',
          description: 'Desc',
          activeStatus: true
        })
      )
    })

    it('should dispatch documentTypeUpdateFailed when API fails', (done) => {
      documentTypeService.updateDocumentTypeById.mockReturnValue(throwError(() => ({ error: 'update error' })))

      effects.updateDocumentType$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentTypeSearchActions.documentTypeUpdateFailed({
            error: 'update error'
          })
        )
        done()
      })

      actions$.next(
        DocumentTypeSearchActions.updateDocumentTypeButtonClicked({
          id: '1',
          name: 'Invoice'
        })
      )
    })
  })

  describe('deleteDocumentType$', () => {
    it('should dispatch documentTypeDeleted when API succeeds', (done) => {
      documentTypeService.deleteDocumentTypeById.mockReturnValue(of(void 0 as any))

      effects.deleteDocumentType$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(DocumentTypeSearchActions.documentTypeDeleted({ id: '1' }))
        done()
      })

      actions$.next(DocumentTypeSearchActions.deleteDocumentTypeButtonClicked({ id: '1' }))
    })

    it('should dispatch documentTypeDeletionFailed when API fails', (done) => {
      documentTypeService.deleteDocumentTypeById.mockReturnValue(throwError(() => ({ error: 'delete error' })))

      effects.deleteDocumentType$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentTypeSearchActions.documentTypeDeletionFailed({
            error: 'delete error'
          })
        )
        done()
      })

      actions$.next(DocumentTypeSearchActions.deleteDocumentTypeButtonClicked({ id: '1' }))
    })
  })

  describe('displayError$', () => {
    const errorCases = [
      {
        action: () => DocumentTypeSearchActions.documentTypesLoadingFailed({ error: 'e' }),
        key: 'DOCUMENT_TYPE_SEARCH.ERROR_MESSAGES.LOAD_FAILED'
      },
      {
        action: () => DocumentTypeSearchActions.documentTypeCreationFailed({ error: 'e' }),
        key: 'DOCUMENT_TYPE_SEARCH.ERROR_MESSAGES.CREATE_FAILED'
      },
      {
        action: () => DocumentTypeSearchActions.documentTypeUpdateFailed({ error: 'e' }),
        key: 'DOCUMENT_TYPE_SEARCH.ERROR_MESSAGES.UPDATE_FAILED'
      },
      {
        action: () => DocumentTypeSearchActions.documentTypeDeletionFailed({ error: 'e' }),
        key: 'DOCUMENT_TYPE_SEARCH.ERROR_MESSAGES.DELETE_FAILED'
      }
    ]

    errorCases.forEach(({ action, key }) => {
      it(`should call messageService.error with ${key}`, (done) => {
        effects.displayError$.pipe(take(1)).subscribe(() => {
          expect(messageService.error).toHaveBeenCalledWith({
            summaryKey: key
          })
          done()
        })
        actions$.next(action())
      })
    })

    it('should not call messageService.error for non-error actions', (done) => {
      effects.displayError$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).not.toHaveBeenCalled()
        done()
      })
      actions$.next(DocumentTypeSearchActions.loadDocumentTypesTriggered())
    })
  })

  describe('displaySuccess$', () => {
    const successCases = [
      {
        action: () =>
          DocumentTypeSearchActions.documentTypeCreated({
            documentType: mockDocumentType
          }),
        key: 'DOCUMENT_TYPE_SEARCH.SUCCESS_MESSAGES.CREATE_SUCCESS'
      },
      {
        action: () =>
          DocumentTypeSearchActions.documentTypeUpdated({
            documentType: mockDocumentType
          }),
        key: 'DOCUMENT_TYPE_SEARCH.SUCCESS_MESSAGES.UPDATE_SUCCESS'
      },
      {
        action: () => DocumentTypeSearchActions.documentTypeDeleted({ id: '1' }),
        key: 'DOCUMENT_TYPE_SEARCH.SUCCESS_MESSAGES.DELETE_SUCCESS'
      }
    ]

    successCases.forEach(({ action, key }) => {
      it(`should call messageService.success with ${key}`, (done) => {
        effects.displaySuccess$.pipe(take(1)).subscribe(() => {
          expect(messageService.success).toHaveBeenCalledWith({
            summaryKey: key
          })
          done()
        })
        actions$.next(action())
      })
    })

    it('should not call messageService.success for non-success actions', (done) => {
      effects.displaySuccess$.pipe(take(1)).subscribe(() => {
        expect(messageService.success).not.toHaveBeenCalled()
        done()
      })
      actions$.next(DocumentTypeSearchActions.loadDocumentTypesTriggered())
    })
  })

  describe('navigateBack$', () => {
    it('should navigate to the mfe base href when navigateBackButtonClicked is dispatched', (done) => {
      const appStateService = TestBed.inject(AppStateService)

      effects.navigateBack$.pipe(take(1)).subscribe(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/test-base'])
        done()
      })

      ;(appStateService.currentMfe$ as any).publish({ baseHref: 'test-base' })
      actions$.next(DocumentTypeSearchActions.navigateBackButtonClicked())
    })
  })
})
