import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import {
  DialogState,
  PortalDialogService,
  PortalMessageService,
} from '@onecx/portal-integration-angular';
import { of, ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { DocumentControllerV1 } from '../../../shared/generated';
import { ExternalFileHandlerService } from '../../service/external-file-handler.service';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import { DocumentDetailsActions } from './document-details.actions';
import { DocumentDetailsEffects } from './document-details.effects';
import { initialState } from './document-details.reducers';
import { documentDetailsSelectors } from './document-details.selectors';
import { selectBackNavigationPossible } from 'src/app/shared/selectors/onecx.selectors';
import { selectUrl } from 'src/app/shared/selectors/router.selectors';

jest.mock('@onecx/ngrx-accelerator', () => {
  const actual = jest.requireActual('@onecx/ngrx-accelerator');
  return {
    ...actual,
    filterForNavigatedTo: () => (source: any) => source,
  };
});

describe('DocumentDetailsEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: DocumentDetailsEffects;
  let store: MockStore<Store>;
  let router: jest.Mocked<Router>;
  let documentService: jest.Mocked<DocumentControllerV1>;
  let messageService: jest.Mocked<PortalMessageService>;
  let portalDialogService: jest.Mocked<PortalDialogService>;
  let fileHandlerService: jest.Mocked<ExternalFileHandlerService>;

  beforeEach(async () => {
    actions$ = new ReplaySubject(1);

    documentService = {
      getDocumentDetailById: jest.fn(),
      updateDocumentDetail: jest.fn(),
      deleteDocumentDetail: jest.fn(),
      getFile: jest.fn(),
    } as unknown as jest.Mocked<DocumentControllerV1>;

    router = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      parseUrl: jest.fn().mockReturnValue({
        toString: () => '/document/details/1',
        queryParams: {},
        fragment: null,
      }),
      events: of(),
    } as unknown as jest.Mocked<Router>;

    messageService = {
      success: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<PortalMessageService>;

    portalDialogService = {
      openDialog: jest.fn(),
    } as unknown as jest.Mocked<PortalDialogService>;

    fileHandlerService = {
      downloadFile: jest.fn(),
    } as unknown as jest.Mocked<ExternalFileHandlerService>;

    await TestBed.configureTestingModule({
      providers: [
        DocumentDetailsEffects,
        provideRouter([]),
        provideMockStore({
          initialState: { document: { details: initialState } },
        }),
        provideMockActions(() => actions$),
        { provide: Router, useValue: router },
        { provide: DocumentControllerV1, useValue: documentService },
        { provide: PortalMessageService, useValue: messageService },
        { provide: PortalDialogService, useValue: portalDialogService },
        { provide: ExternalFileHandlerService, useValue: fileHandlerService },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    effects = TestBed.inject(DocumentDetailsEffects);
  });

  describe('navigatedToDetailsPage$', () => {
    it('should dispatch ensureReferenceDataLoaded and navigatedToDetailsPage when navigating to details', (done) => {
      // selectRouteParam is a factory; override its result via the store directly
      store.setState({
        document: { details: initialState },
        router: {
          state: {
            root: {
              params: { id: 'doc-123' },
              queryParams: {},
              data: {},
              url: [],
              outlet: 'primary',
              component: null,
              routeConfig: null,
              firstChild: null,
              children: [],
              pathFromRoot: [],
            },
            url: '/document/details/doc-123',
          },
        },
      } as any);
      store.refreshState();

      const dispatched: Action[] = [];
      effects.navigatedToDetailsPage$.pipe(take(2)).subscribe({
        next: (a) => dispatched.push(a),
        complete: () => {
          expect(dispatched).toContainEqual(
            DocumentCreateOperationsActions.ensureReferenceDataLoaded()
          );
          expect(
            dispatched.some(
              (a) =>
                a.type === DocumentDetailsActions.navigatedToDetailsPage.type
            )
          ).toBe(true);
          done();
        },
      });

      actions$.next({ type: routerNavigatedAction.type } as any);
    });
  });

  describe('loadDocumentById$', () => {
    it('should dispatch documentDetailsReceived on success', (done) => {
      const details = { id: '1', name: 'Doc' } as any;
      documentService.getDocumentDetailById.mockReturnValue(of(details));

      effects.loadDocumentById$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.documentDetailsReceived({ details })
        );
        done();
      });

      actions$.next(DocumentDetailsActions.navigatedToDetailsPage({ id: '1' }));
    });

    it('should dispatch documentDetailsLoadingFailed on API error', (done) => {
      const error = 'load failed';
      documentService.getDocumentDetailById.mockReturnValue(
        throwError(() => error)
      );

      effects.loadDocumentById$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.documentDetailsLoadingFailed({ error })
        );
        done();
      });

      actions$.next(DocumentDetailsActions.navigatedToDetailsPage({ id: '1' }));
    });

    it('should use empty string when id is undefined in navigatedToDetailsPage', (done) => {
      const details = { id: '', name: 'Doc' } as any;
      documentService.getDocumentDetailById.mockReturnValue(of(details));

      effects.loadDocumentById$.pipe(take(1)).subscribe(() => {
        expect(documentService.getDocumentDetailById).toHaveBeenCalledWith('');
        done();
      });

      actions$.next(
        DocumentDetailsActions.navigatedToDetailsPage({ id: undefined as any })
      );
    });
  });

  describe('cancelButtonNotDirty$', () => {
    it('should dispatch cancelEditNotDirty when form is not dirty', (done) => {
      effects.cancelButtonNotDirty$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(DocumentDetailsActions.cancelEditNotDirty());
        done();
      });

      actions$.next(
        DocumentDetailsActions.cancelButtonClicked({ dirty: false })
      );
    });

    it('should not emit when form is dirty', (done) => {
      let emitted = false;
      effects.cancelButtonNotDirty$.pipe(take(1)).subscribe(() => {
        emitted = true;
      });

      actions$.next(
        DocumentDetailsActions.cancelButtonClicked({ dirty: true })
      );

      setTimeout(() => {
        expect(emitted).toBe(false);
        done();
      }, 50);
    });
  });

  describe('cancelButtonClickedDirty$', () => {
    it('should dispatch cancelEditConfirmClicked when user confirms dialog', (done) => {
      portalDialogService.openDialog.mockReturnValue(
        of({ button: 'primary' } as DialogState<any>)
      );

      effects.cancelButtonClickedDirty$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.cancelEditConfirmClicked()
        );
        done();
      });

      actions$.next(
        DocumentDetailsActions.cancelButtonClicked({ dirty: true })
      );
    });

    it('should dispatch cancelEditBackClicked when user cancels dialog', (done) => {
      portalDialogService.openDialog.mockReturnValue(
        of({ button: 'secondary' } as DialogState<any>)
      );

      effects.cancelButtonClickedDirty$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(DocumentDetailsActions.cancelEditBackClicked());
        done();
      });

      actions$.next(
        DocumentDetailsActions.cancelButtonClicked({ dirty: true })
      );
    });
  });

  describe('saveButtonClicked$', () => {
    it('should dispatch updateDocumentCancelled when details have no id', (done) => {
      store.overrideSelector(documentDetailsSelectors.selectDetails, undefined);
      store.refreshState();

      effects.saveButtonClicked$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.updateDocumentCancelled()
        );
        done();
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({ details: {} as any })
      );
    });

    it('should dispatch updateDocumentSucceeded and documentDetailsReceived on save success', (done) => {
      const prevDetails = {
        id: 'doc-1',
        modificationCount: 1,
        attachments: [],
        documentRelationships: [],
        relatedParties: [],
        categories: [],
      } as any;
      const updatedDetails = { id: 'doc-1', name: 'Updated' } as any;
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        prevDetails
      );
      store.refreshState();
      documentService.updateDocumentDetail.mockReturnValue(of(updatedDetails));

      const dispatched: Action[] = [];
      effects.saveButtonClicked$.pipe(take(2)).subscribe({
        next: (a) => dispatched.push(a),
        complete: () => {
          expect(dispatched).toContainEqual(
            DocumentDetailsActions.updateDocumentSucceeded()
          );
          expect(dispatched).toContainEqual(
            DocumentDetailsActions.documentDetailsReceived({
              details: updatedDetails,
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({
          details: {
            name: 'Updated',
            characteristics: [],
            attachments: [],
          } as any,
        })
      );
    });

    it('should dispatch updateDocumentFailed and show error message on save error', (done) => {
      const prevDetails = {
        id: 'doc-1',
        modificationCount: 1,
        attachments: [],
        documentRelationships: [],
        relatedParties: [],
        categories: [],
      } as any;
      const error = 'update error';
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        prevDetails
      );
      store.refreshState();
      documentService.updateDocumentDetail.mockReturnValue(
        throwError(() => error)
      );

      effects.saveButtonClicked$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.updateDocumentFailed({ error })
        );
        expect(messageService.error).toHaveBeenCalledWith(
          expect.objectContaining({
            summaryKey: 'DOCUMENT_DETAILS.UPDATE.ERROR',
          })
        );
        done();
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({
          details: { name: 'X', characteristics: [], attachments: [] } as any,
        })
      );
    });
  });

  describe('updateSuccess$', () => {
    it('should call messageService.success when updateDocumentSucceeded', (done) => {
      effects.updateSuccess$.pipe(take(1)).subscribe(() => {
        expect(messageService.success).toHaveBeenCalledWith(
          expect.objectContaining({
            summaryKey: 'DOCUMENT_DETAILS.UPDATE.SUCCESS',
          })
        );
        done();
      });

      actions$.next(DocumentDetailsActions.updateDocumentSucceeded());
    });
  });

  describe('deleteButtonClicked$', () => {
    beforeEach(() => {
      store.overrideSelector(documentDetailsSelectors.selectDetails, {
        id: 'doc-1',
      } as any);
      store.refreshState();
    });

    it('should dispatch deleteDocumentCancelled when user cancels dialog', (done) => {
      portalDialogService.openDialog.mockReturnValue(
        of({ button: 'secondary' } as DialogState<any>)
      );

      effects.deleteButtonClicked$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.deleteDocumentCancelled()
        );
        done();
      });

      actions$.next(DocumentDetailsActions.deleteButtonClicked());
    });

    it('should dispatch deleteDocumentSucceeded and show success message when confirmed', (done) => {
      portalDialogService.openDialog.mockReturnValue(
        of({ button: 'primary' } as DialogState<any>)
      );
      documentService.deleteDocumentDetail.mockReturnValue(of({} as any));

      effects.deleteButtonClicked$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.deleteDocumentSucceeded()
        );
        expect(messageService.success).toHaveBeenCalledWith(
          expect.objectContaining({
            summaryKey: 'DOCUMENT_DETAILS.DELETE.SUCCESS',
          })
        );
        done();
      });

      actions$.next(DocumentDetailsActions.deleteButtonClicked());
    });

    it('should dispatch deleteDocumentFailed and show error message on delete error', (done) => {
      const error = 'delete failed';
      portalDialogService.openDialog.mockReturnValue(
        of({ button: 'primary' } as DialogState<any>)
      );
      documentService.deleteDocumentDetail.mockReturnValue(
        throwError(() => error)
      );

      effects.deleteButtonClicked$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.deleteDocumentFailed({ error })
        );
        expect(messageService.error).toHaveBeenCalledWith(
          expect.objectContaining({
            summaryKey: 'DOCUMENT_DETAILS.DELETE.ERROR',
          })
        );
        done();
      });

      actions$.next(DocumentDetailsActions.deleteButtonClicked());
    });
  });

  describe('deleteButtonClicked$ with null itemToDelete and confirmed dialog', () => {
    it('should throw error when itemToDelete is null and dialog is confirmed', (done) => {
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        null as any
      );
      store.refreshState();
      portalDialogService.openDialog.mockReturnValue(
        of({ button: 'primary' } as DialogState<any>)
      );

      effects.deleteButtonClicked$.pipe(take(1)).subscribe({
        error: (err) => {
          expect(err.message).toBe('Item to delete not found!');
          done();
        },
      });

      actions$.next(DocumentDetailsActions.deleteButtonClicked());
    });
  });

  describe('deleteDocumentSucceeded$', () => {
    it('should navigate to parent URL after delete success', (done) => {
      store.overrideSelector(selectUrl, '/document/details/1');
      store.refreshState();

      const mockUrlTree: any = {
        toString: jest.fn(() => '/document/details/1'),
        queryParams: { q: '1' },
        fragment: 'frag',
      };
      router.parseUrl.mockReturnValue(mockUrlTree);

      effects.deleteDocumentSucceeded$.pipe(take(1)).subscribe(() => {
        expect(mockUrlTree.queryParams).toEqual({});
        expect(mockUrlTree.fragment).toBeNull();
        expect(router.navigate).toHaveBeenCalled();
        done();
      });

      actions$.next(DocumentDetailsActions.deleteDocumentSucceeded());
    });
  });

  describe('startAttachmentDownload$', () => {
    it('should dispatch downloadAttachmentBlob on success', (done) => {
      const urlResponse = { url: 'https://example.com/file' } as any;
      documentService.getFile.mockReturnValue(of(urlResponse));

      effects.startAttachmentDownload$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.downloadAttachmentBlob({
            urlResponse,
            fileName: 'test.pdf',
          })
        );
        done();
      });

      actions$.next(
        DocumentDetailsActions.startAttachmentDownload({
          attachmentId: 'att-1',
          fileName: 'test.pdf',
        })
      );
    });

    it('should dispatch attachmentDownloadFailed on API error', (done) => {
      documentService.getFile.mockReturnValue(throwError(() => 'error'));

      effects.startAttachmentDownload$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.attachmentDownloadFailed()
        );
        done();
      });

      actions$.next(
        DocumentDetailsActions.startAttachmentDownload({
          attachmentId: 'att-1',
          fileName: 'test.pdf',
        })
      );
    });
  });

  describe('downloadAttachmentBlob$', () => {
    it('should dispatch saveDownloadedAttachment on success', (done) => {
      const fileBlob = new Blob(['content']);
      const urlResponse = { url: 'https://example.com/file' } as any;
      fileHandlerService.downloadFile.mockReturnValue(of(fileBlob));

      effects.downloadAttachmentBlob$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.saveDownloadedAttachment({
            file: fileBlob,
            fileName: 'test.pdf',
          })
        );
        done();
      });

      actions$.next(
        DocumentDetailsActions.downloadAttachmentBlob({
          urlResponse,
          fileName: 'test.pdf',
        })
      );
    });

    it('should dispatch attachmentDownloadFailed on download error', (done) => {
      fileHandlerService.downloadFile.mockReturnValue(
        throwError(() => 'download error')
      );

      effects.downloadAttachmentBlob$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.attachmentDownloadFailed()
        );
        done();
      });

      actions$.next(
        DocumentDetailsActions.downloadAttachmentBlob({
          urlResponse: {} as any,
          fileName: 'test.pdf',
        })
      );
    });
  });

  describe('saveDownloadAttachment$', () => {
    it('should create an anchor element and trigger download', (done) => {
      const file = new Blob(['data']);
      const anchorSpy = {
        href: '',
        download: '',
        rel: '',
        style: { display: '' },
        click: jest.fn(),
        remove: jest.fn(),
      };
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockReturnValue(anchorSpy as any);
      const appendChildSpy = jest
        .spyOn(document.body, 'appendChild')
        .mockImplementation(() => anchorSpy as any);
      Object.defineProperty(window.URL, 'createObjectURL', {
        value: jest.fn(() => 'blob:url'),
        writable: true,
      });
      Object.defineProperty(window.URL, 'revokeObjectURL', {
        value: jest.fn(),
        writable: true,
      });

      effects.saveDownloadAttachment$.pipe(take(1)).subscribe(() => {
        expect(anchorSpy.download).toBe('test.pdf');
        expect(anchorSpy.click).toHaveBeenCalled();
        expect(anchorSpy.remove).toHaveBeenCalled();
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        done();
      });

      actions$.next(
        DocumentDetailsActions.saveDownloadedAttachment({
          file,
          fileName: 'test.pdf',
        })
      );
    });
  });

  describe('displayError$', () => {
    it('should call messageService.error on documentDetailsLoadingFailed', (done) => {
      effects.displayError$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).toHaveBeenCalled();
        done();
      });
      actions$.next(
        DocumentDetailsActions.documentDetailsLoadingFailed({ error: 'err' })
      );
    });

    it('should call messageService.error on attachmentDownloadFailed', (done) => {
      effects.displayError$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).toHaveBeenCalled();
        done();
      });
      actions$.next(DocumentDetailsActions.attachmentDownloadFailed());
    });

    it('should not call messageService.error for unrelated actions', (done) => {
      effects.displayError$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).not.toHaveBeenCalled();
        done();
      });
      actions$.next(DocumentDetailsActions.editButtonClicked());
    });
  });

  describe('navigateBack$', () => {
    it('should dispatch backNavigationStarted and call window.history.back when navigation is possible', (done) => {
      store.overrideSelector(selectBackNavigationPossible, true);
      store.refreshState();
      const historyBackSpy = jest
        .spyOn(window.history, 'back')
        .mockImplementation(() => {});

      effects.navigateBack$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(DocumentDetailsActions.backNavigationStarted());
        expect(historyBackSpy).toHaveBeenCalled();
        historyBackSpy.mockRestore();
        done();
      });

      actions$.next(DocumentDetailsActions.navigateBackButtonClicked());
    });

    it('should dispatch backNavigationFailed when navigation is not possible', (done) => {
      store.overrideSelector(selectBackNavigationPossible, false);
      store.refreshState();

      effects.navigateBack$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(DocumentDetailsActions.backNavigationFailed());
        done();
      });

      actions$.next(DocumentDetailsActions.navigateBackButtonClicked());
    });
  });

  describe('buildDocumentUpdate null branches (via saveButtonClicked$)', () => {
    it('should build update with empty arrays when documentRelationships, relatedParties, categories are null', (done) => {
      const prevDetails = {
        id: 'doc-1',
        modificationCount: 0,
        attachments: [],
        documentRelationships: null,
        relatedParties: null,
        categories: null,
        relatedObject: null,
      } as any;
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        prevDetails
      );
      store.refreshState();
      documentService.updateDocumentDetail.mockReturnValue(
        of({ id: 'doc-1' } as any)
      );

      effects.saveButtonClicked$.pipe(take(2)).subscribe({
        next: () => {},
        complete: () => {
          expect(documentService.updateDocumentDetail).toHaveBeenCalledWith(
            'doc-1',
            expect.objectContaining({
              documentRelationships: [],
              relatedParties: [],
              categories: [],
              relatedObject: undefined,
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({
          details: { name: 'X', characteristics: [], attachments: [] } as any,
        })
      );
    });

    it('should map relatedObject fields when relatedObject is present in prevState', (done) => {
      const prevDetails = {
        id: 'doc-1',
        modificationCount: 0,
        attachments: [],
        documentRelationships: [
          { id: 'rel-1', type: 'RELATED', documentRefId: 'ref-1' },
        ],
        relatedParties: [
          { id: 'p1', name: 'Party', role: 'OWNER', validFor: null },
        ],
        categories: [{ id: 'cat-1', name: 'Cat', categoryVersion: 1 }],
        relatedObject: { id: 'obj-1' },
      } as any;
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        prevDetails
      );
      store.refreshState();
      documentService.updateDocumentDetail.mockReturnValue(
        of({ id: 'doc-1' } as any)
      );

      effects.saveButtonClicked$.pipe(take(2)).subscribe({
        next: () => {},
        complete: () => {
          expect(documentService.updateDocumentDetail).toHaveBeenCalledWith(
            'doc-1',
            expect.objectContaining({
              documentRelationships: [
                { id: 'rel-1', type: 'RELATED', documentRefId: 'ref-1' },
              ],
              relatedParties: [
                { id: 'p1', name: 'Party', role: 'OWNER', validFor: null },
              ],
              categories: [{ id: 'cat-1', name: 'Cat', categoryVersion: 1 }],
              relatedObject: expect.objectContaining({ id: 'obj-1' }),
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({
          details: { name: 'X', characteristics: [], attachments: [] } as any,
        })
      );
    });

    it('should map attachment fields via mapAttachments when prevState has attachments', (done) => {
      const prevDetails = {
        id: 'doc-1',
        modificationCount: 0,
        attachments: [
          {
            id: 'att-1',
            type: 'pdf',
            validFor: null,
            mimeType: { id: 'mime-1' },
            fileName: 'doc.pdf',
          },
        ],
        documentRelationships: [],
        relatedParties: [],
        categories: [],
      } as any;
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        prevDetails
      );
      store.refreshState();
      documentService.updateDocumentDetail.mockReturnValue(
        of({ id: 'doc-1' } as any)
      );

      effects.saveButtonClicked$.pipe(take(2)).subscribe({
        next: () => {},
        complete: () => {
          expect(documentService.updateDocumentDetail).toHaveBeenCalledWith(
            'doc-1',
            expect.objectContaining({
              attachments: [
                expect.objectContaining({
                  id: 'att-1',
                  name: 'Attachment Name',
                  description: 'A description',
                  mimeTypeId: 'mime-1',
                  fileName: 'doc.pdf',
                }),
              ],
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({
          details: {
            name: 'X',
            characteristics: [],
            attachments: [
              {
                id: 'att-1',
                name: 'Attachment Name',
                description: 'A description',
              },
            ],
          } as any,
        })
      );
    });

    it('should include specification fields when prevState has specification', (done) => {
      const prevDetails = {
        id: 'doc-1',
        modificationCount: 0,
        attachments: [],
        documentRelationships: [],
        relatedParties: [],
        categories: [],
        specification: { name: 'spec-1', specificationVersion: '2.0' },
      } as any;
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        prevDetails
      );
      store.refreshState();
      documentService.updateDocumentDetail.mockReturnValue(
        of({ id: 'doc-1' } as any)
      );

      effects.saveButtonClicked$.pipe(take(2)).subscribe({
        next: () => {},
        complete: () => {
          expect(documentService.updateDocumentDetail).toHaveBeenCalledWith(
            'doc-1',
            expect.objectContaining({
              specification: expect.objectContaining({
                specificationVersion: '2.0',
              }),
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({
          details: {
            name: 'X',
            characteristics: [],
            attachments: [],
            specification: 'new-spec',
          } as any,
        })
      );
    });

    it('should use empty array for attachments when prevState has undefined attachments', (done) => {
      const prevDetails = {
        id: 'doc-1',
        modificationCount: 0,
        attachments: undefined,
        documentRelationships: [],
        relatedParties: [],
        categories: [],
      } as any;
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        prevDetails
      );
      store.refreshState();
      documentService.updateDocumentDetail.mockReturnValue(
        of({ id: 'doc-1' } as any)
      );

      effects.saveButtonClicked$.pipe(take(2)).subscribe({
        next: () => {},
        complete: () => {
          expect(documentService.updateDocumentDetail).toHaveBeenCalledWith(
            'doc-1',
            expect.objectContaining({ attachments: [] })
          );
          done();
        },
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({
          details: { name: 'X', characteristics: [], attachments: [] } as any,
        })
      );
    });

    it('should map characteristics with non-null id via mapCharacteristics', (done) => {
      const prevDetails = {
        id: 'doc-1',
        modificationCount: 0,
        attachments: [],
        documentRelationships: [],
        relatedParties: [],
        categories: [],
      } as any;
      store.overrideSelector(
        documentDetailsSelectors.selectDetails,
        prevDetails
      );
      store.refreshState();
      documentService.updateDocumentDetail.mockReturnValue(
        of({ id: 'doc-1' } as any)
      );

      effects.saveButtonClicked$.pipe(take(2)).subscribe({
        next: () => {},
        complete: () => {
          expect(documentService.updateDocumentDetail).toHaveBeenCalledWith(
            'doc-1',
            expect.objectContaining({
              characteristics: [
                expect.objectContaining({
                  id: 'char-1',
                  name: 'color',
                  value: 'red',
                }),
              ],
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentDetailsActions.saveButtonClicked({
          details: {
            name: 'X',
            attachments: [],
            characteristics: [{ id: 'char-1', name: 'color', value: 'red' }],
          } as any,
        })
      );
    });
  });

  describe('deleteButtonClicked$ null dialogResult branch', () => {
    it('should dispatch deleteDocumentCancelled when dialogResult is null', (done) => {
      store.overrideSelector(documentDetailsSelectors.selectDetails, {
        id: 'doc-1',
      } as any);
      store.refreshState();
      portalDialogService.openDialog.mockReturnValue(of(null as any));

      effects.deleteButtonClicked$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentDetailsActions.deleteDocumentCancelled()
        );
        done();
      });

      actions$.next(DocumentDetailsActions.deleteButtonClicked());
    });
  });
});
