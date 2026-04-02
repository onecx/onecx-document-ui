import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppStateService } from '@onecx/angular-integration-interface';
import { provideAppStateServiceMock } from '@onecx/angular-integration-interface/mocks';
import { of, ReplaySubject, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  DocumentControllerV1,
  DocumentTypeControllerV1,
  SupportedMimeTypeControllerV1,
} from 'src/app/shared/generated';
import { ExternalFileHandlerService } from '../service/external-file-handler.service';
import { DocumentCreateOperationsActions } from './document-create-operations.actions';
import { DocumentCreateOperationsEffects } from './document-create-operations.effects';
import { documentQuickUploadSelectors } from '../pages/document-quick-upload/document-quick-upload.selectors';
import { initialState as quickUploadInitialState } from '../pages/document-quick-upload/document-quick-upload.reducers';

describe('DocumentCreateOperationsEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: DocumentCreateOperationsEffects;
  let store: MockStore<Store>;
  let documentService: jest.Mocked<DocumentControllerV1>;
  let documentTypeService: jest.Mocked<DocumentTypeControllerV1>;
  let mimeTypeService: jest.Mocked<SupportedMimeTypeControllerV1>;
  let uploaderService: jest.Mocked<ExternalFileHandlerService>;
  let appStateService: AppStateService;

  beforeEach(async () => {
    actions$ = new ReplaySubject(1);

    documentService = {
      createDocument: jest.fn(),
      uploadAllFiles: jest.fn(),
      updateAttachmentsMetadata: jest.fn(),
      createFailedAttachmentsAuditLogs: jest.fn(),
    } as unknown as jest.Mocked<DocumentControllerV1>;

    documentTypeService = {
      getAllTypesOfDocument: jest.fn(),
    } as unknown as jest.Mocked<DocumentTypeControllerV1>;

    mimeTypeService = {
      getAllSupportedMimeTypes: jest.fn(),
    } as unknown as jest.Mocked<SupportedMimeTypeControllerV1>;

    uploaderService = {
      uploadAttachment: jest.fn(),
    } as unknown as jest.Mocked<ExternalFileHandlerService>;

    await TestBed.configureTestingModule({
      providers: [
        DocumentCreateOperationsEffects,
        provideRouter([]),
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: { document: { quickUpload: quickUploadInitialState } },
        }),
        provideAppStateServiceMock(),
        { provide: DocumentControllerV1, useValue: documentService },
        { provide: DocumentTypeControllerV1, useValue: documentTypeService },
        { provide: SupportedMimeTypeControllerV1, useValue: mimeTypeService },
        { provide: ExternalFileHandlerService, useValue: uploaderService },
      ],
    });

    effects = TestBed.inject(DocumentCreateOperationsEffects);
    store = TestBed.inject<MockStore<Store>>(MockStore);
    appStateService = TestBed.inject(AppStateService);
  });

  describe('loadReferenceDataOnRouteEnter$', () => {
    it('should dispatch ensureReferenceDataLoaded when navigating to quick-upload', (done) => {
      effects.loadReferenceDataOnRouteEnter$
        .pipe(take(1))
        .subscribe((action) => {
          expect(action).toEqual(
            DocumentCreateOperationsActions.ensureReferenceDataLoaded()
          );
          done();
        });

      actions$.next({
        type: routerNavigatedAction.type,
        payload: { routerState: { url: '/document-management/quick-upload' } },
      } as any);
    });

    it('should dispatch ensureReferenceDataLoaded when navigating to create-document', (done) => {
      effects.loadReferenceDataOnRouteEnter$
        .pipe(take(1))
        .subscribe((action) => {
          expect(action).toEqual(
            DocumentCreateOperationsActions.ensureReferenceDataLoaded()
          );
          done();
        });

      actions$.next({
        type: routerNavigatedAction.type,
        payload: {
          routerState: { url: '/document-management/create-document' },
        },
      } as any);
    });

    it('should not emit when navigating to an unrelated route', (done) => {
      const emitted: Action[] = [];
      effects.loadReferenceDataOnRouteEnter$.pipe(take(1)).subscribe({
        next: (a) => emitted.push(a),
      });

      actions$.next({
        type: routerNavigatedAction.type,
        payload: { routerState: { url: '/document-management/search' } },
      } as any);

      setTimeout(() => {
        expect(emitted).toHaveLength(0);
        done();
      }, 50);
    });
  });

  describe('ensureReferenceDataLoaded$', () => {
    it('should fetch types and mimeTypes from API when store is empty', (done) => {
      const types = [{ id: 't1', name: 'Invoice' }] as any;
      const mimeTypes = [{ id: 'm1', name: 'application/pdf' }] as any;
      documentTypeService.getAllTypesOfDocument.mockReturnValue(of(types));
      mimeTypeService.getAllSupportedMimeTypes.mockReturnValue(of(mimeTypes));

      store.overrideSelector(
        documentQuickUploadSelectors.selectAvailableDocumentTypes,
        []
      );
      store.overrideSelector(
        documentQuickUploadSelectors.selectAvailableMimeTypes,
        []
      );
      store.refreshState();

      const dispatched: Action[] = [];
      effects.ensureReferenceDataLoaded$.pipe(take(2)).subscribe({
        next: (a) => dispatched.push(a),
        complete: () => {
          expect(dispatched).toContainEqual(
            DocumentCreateOperationsActions.availableDocumentTypesReceived({
              types,
            })
          );
          expect(dispatched).toContainEqual(
            DocumentCreateOperationsActions.availableMimeTypesReceived({
              mimeTypes,
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentCreateOperationsActions.ensureReferenceDataLoaded()
      );
    });

    it('should use cached types from store and only fetch mimeTypes', (done) => {
      const cachedTypes = [{ id: 't1' }] as any;
      const mimeTypes = [{ id: 'm1' }] as any;
      mimeTypeService.getAllSupportedMimeTypes.mockReturnValue(of(mimeTypes));

      store.overrideSelector(
        documentQuickUploadSelectors.selectAvailableDocumentTypes,
        cachedTypes
      );
      store.overrideSelector(
        documentQuickUploadSelectors.selectAvailableMimeTypes,
        []
      );
      store.refreshState();

      const dispatched: Action[] = [];
      effects.ensureReferenceDataLoaded$.pipe(take(2)).subscribe({
        next: (a) => dispatched.push(a),
        complete: () => {
          expect(
            documentTypeService.getAllTypesOfDocument
          ).not.toHaveBeenCalled();
          expect(dispatched).toContainEqual(
            DocumentCreateOperationsActions.availableDocumentTypesReceived({
              types: cachedTypes,
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentCreateOperationsActions.ensureReferenceDataLoaded()
      );
    });

    it('should dispatch loadReferenceDataFailed on API error', (done) => {
      const error = new Error('Network failure');
      documentTypeService.getAllTypesOfDocument.mockReturnValue(
        throwError(() => error)
      );
      mimeTypeService.getAllSupportedMimeTypes.mockReturnValue(of([]) as any);

      store.overrideSelector(
        documentQuickUploadSelectors.selectAvailableDocumentTypes,
        []
      );
      store.overrideSelector(
        documentQuickUploadSelectors.selectAvailableMimeTypes,
        []
      );
      store.refreshState();

      effects.ensureReferenceDataLoaded$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateOperationsActions.loadReferenceDataFailed({
            error: 'Network failure',
          })
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.ensureReferenceDataLoaded()
      );
    });

    it('should use cached mimeTypes from store and only fetch documentTypes', (done) => {
      const types = [{ id: 't1' }] as any;
      const cachedMimeTypes = [{ id: 'm1' }] as any;
      documentTypeService.getAllTypesOfDocument.mockReturnValue(of(types));

      store.overrideSelector(
        documentQuickUploadSelectors.selectAvailableDocumentTypes,
        []
      );
      store.overrideSelector(
        documentQuickUploadSelectors.selectAvailableMimeTypes,
        cachedMimeTypes
      );
      store.refreshState();

      const dispatched: Action[] = [];
      effects.ensureReferenceDataLoaded$.pipe(take(2)).subscribe({
        next: (a) => dispatched.push(a),
        complete: () => {
          expect(
            mimeTypeService.getAllSupportedMimeTypes
          ).not.toHaveBeenCalled();
          expect(dispatched).toContainEqual(
            DocumentCreateOperationsActions.availableMimeTypesReceived({
              mimeTypes: cachedMimeTypes,
            })
          );
          done();
        },
      });

      actions$.next(
        DocumentCreateOperationsActions.ensureReferenceDataLoaded()
      );
    });
  });

  describe('startDocumentCreation$', () => {
    it('should dispatch documentCreatedSuccesfully when createDocument succeeds', (done) => {
      const createdDocument = { id: 'doc-1', attachments: [] } as any;
      const files = [{ file: new File([], 'a.pdf'), fileName: 'a.pdf' }];
      documentService.createDocument.mockReturnValue(of(createdDocument));

      effects.startDocumentCreation$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateOperationsActions.documentCreatedSuccesfully({
            createdDocument,
            files,
          })
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.startDocumentCreation({
          docRequest: {} as any,
          files,
        })
      );
    });

    it('should dispatch documentCreationFailed when createDocument fails', (done) => {
      documentService.createDocument.mockReturnValue(
        throwError(() => new Error('API error'))
      );

      effects.startDocumentCreation$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateOperationsActions.documentCreationFailed()
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.startDocumentCreation({
          docRequest: {} as any,
          files: [],
        })
      );
    });
  });

  describe('documentCreatedSuccesfully$', () => {
    it('should dispatch requestDocumentUploadUrls with matched attachment IDs', (done) => {
      const createdDocument = {
        id: 'doc-1',
        attachments: [{ id: 'att-1', fileName: 'file.pdf' }],
      } as any;
      const files = [{ file: new File([], 'file.pdf'), fileName: 'file.pdf' }];

      effects.documentCreatedSuccesfully$
        .pipe(take(1))
        .subscribe((action: any) => {
          expect(action.type).toBe(
            DocumentCreateOperationsActions.requestDocumentUploadUrls.type
          );
          expect(action.files[0].attachmentId).toBe('att-1');
          done();
        });

      actions$.next(
        DocumentCreateOperationsActions.documentCreatedSuccesfully({
          createdDocument,
          files,
        })
      );
    });
  });

  describe('requestDocumentUploadUrls$', () => {
    it('should dispatch uploadAttachment for each presigned URL response', (done) => {
      const file = new File(['content'], 'file.pdf');
      const presignedResponses = [
        { attachmentId: 'att-1', url: 'https://upload.url/1' },
      ];
      documentService.uploadAllFiles.mockReturnValue(
        of(presignedResponses) as any
      );

      effects.requestDocumentUploadUrls$
        .pipe(take(1))
        .subscribe((action: any) => {
          expect(action.type).toBe(
            DocumentCreateOperationsActions.uploadAttachment.type
          );
          expect(action.attachmentId).toBe('att-1');
          expect(action.presignedUrl).toBe('https://upload.url/1');
          done();
        });

      actions$.next(
        DocumentCreateOperationsActions.requestDocumentUploadUrls({
          createdDocument: { id: 'doc-1' } as any,
          uploadRequests: [],
          files: [{ file, fileName: 'file.pdf', attachmentId: 'att-1' }],
        })
      );
    });
  });

  describe('uploadAttachment$', () => {
    it('should dispatch uploadAttachmentSuccess when upload succeeds', (done) => {
      uploaderService.uploadAttachment.mockReturnValue(of(undefined as any));

      effects.uploadAttachment$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateOperationsActions.uploadAttachmentSuccess({
            documentId: 'doc-1',
            attachmentId: 'att-1',
          })
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.uploadAttachment({
          presignedUrl: 'https://upload.url/1',
          file: new File([], 'file.pdf'),
          documentId: 'doc-1',
          attachmentId: 'att-1',
        })
      );
    });

    it('should dispatch attachmentUploadFailed when upload fails', (done) => {
      uploaderService.uploadAttachment.mockReturnValue(
        throwError(() => new Error('Upload error'))
      );

      effects.uploadAttachment$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateOperationsActions.attachmentUploadFailed({
            documentId: 'doc-1',
            attachmentId: 'att-1',
          })
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.uploadAttachment({
          presignedUrl: 'https://upload.url/fail',
          file: new File([], 'file.pdf'),
          documentId: 'doc-1',
          attachmentId: 'att-1',
        })
      );
    });
  });

  describe('trackUploadCompletion$', () => {
    it('should dispatch allAttachmentsUploaded when pendingAttachmentUploads reaches 0', (done) => {
      store.overrideSelector(
        documentQuickUploadSelectors.selectPendingAttachmentUploads,
        0
      );
      store.overrideSelector(
        documentQuickUploadSelectors.selectSuccessfulAttachmentIds,
        ['att-1']
      );
      store.overrideSelector(
        documentQuickUploadSelectors.selectFailedAttachmentIds,
        []
      );
      store.refreshState();

      effects.trackUploadCompletion$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateOperationsActions.allAttachmentsUploaded({
            documentId: 'doc-1',
            successfulIds: ['att-1'],
            failedIds: [],
          })
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.uploadAttachmentSuccess({
          documentId: 'doc-1',
          attachmentId: 'att-1',
        })
      );
    });

    it('should not dispatch when pendingAttachmentUploads is greater than 0', (done) => {
      store.overrideSelector(
        documentQuickUploadSelectors.selectPendingAttachmentUploads,
        2
      );
      store.refreshState();

      const emitted: Action[] = [];
      effects.trackUploadCompletion$.pipe(take(1)).subscribe({
        next: (a) => emitted.push(a),
      });

      actions$.next(
        DocumentCreateOperationsActions.uploadAttachmentSuccess({
          documentId: 'doc-1',
          attachmentId: 'att-1',
        })
      );

      setTimeout(() => {
        expect(emitted).toHaveLength(0);
        done();
      }, 50);
    });
  });

  describe('allAttachmentsUploaded$', () => {
    it('should dispatch documentCreationCompleted when metadata update succeeds', (done) => {
      documentService.updateAttachmentsMetadata.mockReturnValue(
        of(null as any)
      );

      effects.allAttachmentsUploaded$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateOperationsActions.documentCreationCompleted({
            documentId: 'doc-1',
          })
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.allAttachmentsUploaded({
          documentId: 'doc-1',
          successfulIds: ['att-1'],
          failedIds: [],
        })
      );
    });

    it('should call createFailedAttachmentsAuditLogs when there are failed IDs', (done) => {
      documentService.updateAttachmentsMetadata.mockReturnValue(
        of(null as any)
      );
      documentService.createFailedAttachmentsAuditLogs.mockReturnValue(
        of(null as any)
      );

      effects.allAttachmentsUploaded$.pipe(take(1)).subscribe(() => {
        expect(
          documentService.createFailedAttachmentsAuditLogs
        ).toHaveBeenCalledWith('doc-1', [{ attachmentId: 'att-fail' }]);
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.allAttachmentsUploaded({
          documentId: 'doc-1',
          successfulIds: ['att-1'],
          failedIds: ['att-fail'],
        })
      );
    });

    it('should skip metadata update when no successful IDs and dispatch completed', (done) => {
      documentService.createFailedAttachmentsAuditLogs.mockReturnValue(
        of(null as any)
      );

      effects.allAttachmentsUploaded$.pipe(take(1)).subscribe((action) => {
        expect(
          documentService.updateAttachmentsMetadata
        ).not.toHaveBeenCalled();
        expect(action.type).toBe(
          DocumentCreateOperationsActions.documentCreationCompleted.type
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.allAttachmentsUploaded({
          documentId: 'doc-1',
          successfulIds: [],
          failedIds: ['att-fail'],
        })
      );
    });

    it('should dispatch documentCreationFinalStepFailed when metadata update fails', (done) => {
      documentService.updateAttachmentsMetadata.mockReturnValue(
        throwError(() => new Error('Metadata error'))
      );

      effects.allAttachmentsUploaded$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateOperationsActions.documentCreationFinalStepFailed({
            documentId: 'doc-1',
          })
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.allAttachmentsUploaded({
          documentId: 'doc-1',
          successfulIds: ['att-1'],
          failedIds: [],
        })
      );
    });
  });

  describe('navigateToDetails$', () => {
    it('should navigate to document details after documentCreationCompleted', (done) => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest
        .spyOn(router, 'navigate')
        .mockResolvedValue(true);

      (appStateService.currentMfe$ as any).publish({ baseHref: '/app' });

      effects.navigateToDetails$.pipe(take(1)).subscribe(() => {
        expect(navigateSpy).toHaveBeenCalledWith(
          expect.arrayContaining(['document-management', 'details', 'doc-1'])
        );
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.documentCreationCompleted({
          documentId: 'doc-1',
        })
      );
    });
  });
});
