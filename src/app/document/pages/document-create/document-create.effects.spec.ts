import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { routerNavigatedAction } from '@ngrx/router-store';
import { Action, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { PortalMessageService } from '@onecx/portal-integration-angular';
import { of, ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import { DocumentCreateActions } from './document-create.actions';
import { DocumentCreateEffects } from './document-create.effects';
import { initialState } from './document-create.reducers';
import { selectDocumentCreateSubmissionSource } from './document-create.selectors';
import { DocumentCreateStep } from '../../types/document-create-step.enum';

jest.mock('@onecx/ngrx-accelerator', () => {
  const actual = jest.requireActual('@onecx/ngrx-accelerator');
  return {
    ...actual,
    filterForNavigatedTo: () => (source: any) => source,
  };
});

describe('DocumentCreateEffects', () => {
  let actions$: ReplaySubject<Action>;
  let effects: DocumentCreateEffects;
  let store: MockStore<Store>;
  let messageService: jest.Mocked<PortalMessageService>;

  beforeEach(async () => {
    actions$ = new ReplaySubject(1);

    messageService = {
      success: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<PortalMessageService>;

    await TestBed.configureTestingModule({
      providers: [
        DocumentCreateEffects,
        provideRouter([]),
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: { document: { create: initialState } },
        }),
        { provide: PortalMessageService, useValue: messageService },
      ],
    });

    effects = TestBed.inject(DocumentCreateEffects);
    store = TestBed.inject<MockStore<Store>>(MockStore);
  });

  describe('navigatedToCreatePage$', () => {
    it('should dispatch enteredPage when navigating to create document page', (done) => {
      effects.navigatedToCreatePage$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(DocumentCreateActions.enteredPage());
        done();
      });

      actions$.next({ type: routerNavigatedAction.type } as any);
    });
  });

  describe('attachmentMimeTypeNotSupported$', () => {
    it('should call messageService.error with MIME_TYPE_NOT_SUPPORTED summary key', (done) => {
      effects.attachmentMimeTypeNotSupported$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).toHaveBeenCalledWith({
          summaryKey:
            'DOCUMENT_CREATE.ATTACHMENTS.ERROR_MESSAGES.MIME_TYPE_NOT_SUPPORTED',
        });
        done();
      });

      actions$.next(
        DocumentCreateActions.attachmentMimeTypeNotSupported({
          fileName: 'test.exe',
        })
      );
    });
  });

  describe('submitDocumentCreation$', () => {
    it('should dispatch startDocumentCreation when all required fields are present', (done) => {
      const source = {
        details: {
          name: 'My Document',
          type: 'type-1',
          channel: 'channel-1',
          status: 'Draft',
        },
        attachments: [
          {
            name: 'file.pdf',
            description: null,
            mimeTypeId: 'mime-1',
            validForEnd: null,
            fileName: 'file.pdf',
            file: new File(['content'], 'file.pdf'),
          },
        ],
        characteristics: [],
      };
      store.overrideSelector(
        selectDocumentCreateSubmissionSource,
        source as any
      );
      store.refreshState();

      effects.submitDocumentCreation$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe(
          DocumentCreateOperationsActions.startDocumentCreation.type
        );
        done();
      });

      actions$.next(DocumentCreateActions.submitClicked());
    });

    it('should dispatch stepValidationFailed when details name is missing', (done) => {
      const source = {
        details: { name: null, type: 'type-1', channel: 'channel-1' },
        attachments: [],
        characteristics: [],
      };
      store.overrideSelector(
        selectDocumentCreateSubmissionSource,
        source as any
      );
      store.refreshState();

      effects.submitDocumentCreation$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(
          DocumentCreateActions.stepValidationFailed({
            error: 'DOCUMENT_CREATE.ERROR_MESSAGES.SUBMIT_VALIDATION',
          })
        );
        done();
      });

      actions$.next(DocumentCreateActions.submitClicked());
    });

    it('should dispatch stepValidationFailed when details type is missing', (done) => {
      const source = {
        details: { name: 'Doc', type: null, channel: 'channel-1' },
        attachments: [],
        characteristics: [],
      };
      store.overrideSelector(
        selectDocumentCreateSubmissionSource,
        source as any
      );
      store.refreshState();

      effects.submitDocumentCreation$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe(
          DocumentCreateActions.stepValidationFailed.type
        );
        done();
      });

      actions$.next(DocumentCreateActions.submitClicked());
    });

    it('should dispatch stepValidationFailed when details is null', (done) => {
      const source = { details: null, attachments: [], characteristics: [] };
      store.overrideSelector(
        selectDocumentCreateSubmissionSource,
        source as any
      );
      store.refreshState();

      effects.submitDocumentCreation$.pipe(take(1)).subscribe((action) => {
        expect(action.type).toBe(
          DocumentCreateActions.stepValidationFailed.type
        );
        done();
      });

      actions$.next(DocumentCreateActions.submitClicked());
    });
  });

  describe('onDocumentCreationCompleted$', () => {
    it('should call messageService.success with CREATE_SUCCESS key', (done) => {
      effects.onDocumentCreationCompleted$.pipe(take(1)).subscribe(() => {
        expect(messageService.success).toHaveBeenCalledWith({
          summaryKey: 'DOCUMENT_CREATE.SUCCESS_MESSAGES.CREATE_SUCCESS',
        });
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.documentCreationCompleted({
          documentId: 'doc-1',
        })
      );
    });
  });

  describe('onDocumentCreationFailed$', () => {
    it('should call messageService.error when documentCreationFailed', (done) => {
      effects.onDocumentCreationFailed$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).toHaveBeenCalledWith({
          summaryKey: 'DOCUMENT_CREATE.ERROR_MESSAGES.CREATE_ERROR',
        });
        done();
      });

      actions$.next(DocumentCreateOperationsActions.documentCreationFailed());
    });

    it('should call messageService.error when documentCreationFinalStepFailed', (done) => {
      effects.onDocumentCreationFailed$.pipe(take(1)).subscribe(() => {
        expect(messageService.error).toHaveBeenCalledWith({
          summaryKey: 'DOCUMENT_CREATE.ERROR_MESSAGES.CREATE_ERROR',
        });
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.documentCreationFinalStepFailed({
          documentId: 'doc-1',
        })
      );
    });
  });

  describe('onDocumentCreationFinished$', () => {
    [
      DocumentCreateOperationsActions.documentCreationCompleted({
        documentId: 'doc-1',
      }),
      DocumentCreateOperationsActions.documentCreationFailed(),
      DocumentCreateOperationsActions.documentCreationFinalStepFailed({
        documentId: 'doc-1',
      }),
    ].forEach((trigger) => {
      it(`should dispatch submitFinished on ${trigger.type}`, (done) => {
        effects.onDocumentCreationFinished$
          .pipe(take(1))
          .subscribe((action) => {
            expect(action).toEqual(DocumentCreateActions.submitFinished());
            done();
          });

        actions$.next(trigger);
      });
    });
  });

  describe('resetStateOnSubmitSuccess$', () => {
    it('should dispatch resetClicked after documentCreationCompleted', (done) => {
      effects.resetStateOnSubmitSuccess$.pipe(take(1)).subscribe((action) => {
        expect(action).toEqual(DocumentCreateActions.resetClicked());
        done();
      });

      actions$.next(
        DocumentCreateOperationsActions.documentCreationCompleted({
          documentId: 'doc-1',
        })
      );
    });
  });

  describe('resetStateWhenLeavingCreatePage$', () => {
    it('should dispatch resetClicked when URL does not include /create-document', (done) => {
      effects.resetStateWhenLeavingCreatePage$
        .pipe(take(1))
        .subscribe((action) => {
          expect(action).toEqual(DocumentCreateActions.resetClicked());
          done();
        });

      actions$.next({
        type: routerNavigatedAction.type,
        payload: { routerState: { url: '/document-management/search' } },
      } as any);
    });

    it('should not dispatch resetClicked when URL contains /create-document', (done) => {
      const emitted: Action[] = [];
      effects.resetStateWhenLeavingCreatePage$.pipe(take(1)).subscribe({
        next: (a) => emitted.push(a),
        error: done,
      });

      actions$.next({
        type: routerNavigatedAction.type,
        payload: {
          routerState: { url: '/document-management/create-document' },
        },
      } as any);

      // give the observable a tick to emit if it would
      setTimeout(() => {
        expect(emitted).toHaveLength(0);
        done();
      }, 50);
    });
  });

  describe('mapSubmitPayload (through submitDocumentCreation$)', () => {
    it('should map attachments with validFor endDateTime', (done) => {
      const source = {
        details: {
          name: 'Doc',
          type: 'type-1',
          channel: 'ch-1',
          status: 'Draft',
          description: 'desc',
          version: '1.0',
          involvement: null,
          objectReferenceType: null,
          objectReferenceId: null,
        },
        attachments: [
          {
            name: 'file.pdf',
            description: 'attach desc',
            mimeTypeId: 'mime-1',
            validForEnd: '2025-12-31',
            fileName: 'file.pdf',
            file: new File(['content'], 'file.pdf'),
          },
        ],
        characteristics: [
          { id: null, name: 'color', value: 'red' },
          { id: null, name: '', value: '' }, // should be filtered out
        ],
      };
      store.overrideSelector(
        selectDocumentCreateSubmissionSource,
        source as any
      );
      store.refreshState();

      effects.submitDocumentCreation$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toBe(
          DocumentCreateOperationsActions.startDocumentCreation.type
        );
        expect(action.docRequest.attachments[0].validFor).toEqual({
          endDateTime: '2025-12-31',
        });
        expect(action.docRequest.characteristics).toHaveLength(1);
        expect(action.docRequest.characteristics[0].name).toBe('color');
        done();
      });

      actions$.next(DocumentCreateActions.submitClicked());
    });

    it('should dispatch stepValidationFailed when details channel is missing', (done) => {
      const source = {
        details: { name: 'Doc', type: 'type-1', channel: null },
        attachments: [],
        characteristics: [],
      };
      store.overrideSelector(
        selectDocumentCreateSubmissionSource,
        source as any
      );
      store.refreshState();

      effects.submitDocumentCreation$.pipe(take(1)).subscribe((action: any) => {
        expect(action.type).toBe(
          DocumentCreateActions.stepValidationFailed.type
        );
        done();
      });

      actions$.next(DocumentCreateActions.submitClicked());
    });

    it('should map non-null involvement fields in relatedObject when provided', (done) => {
      const source = {
        details: {
          name: 'Doc',
          type: 'type-1',
          channel: 'ch-1',
          status: 'Draft',
          description: null,
          version: null,
          involvement: 'OWNER',
          objectReferenceType: 'CONTRACT',
          objectReferenceId: 'ref-1',
        },
        attachments: [],
        characteristics: [],
      };
      store.overrideSelector(
        selectDocumentCreateSubmissionSource,
        source as any
      );
      store.refreshState();

      effects.submitDocumentCreation$.pipe(take(1)).subscribe((action: any) => {
        expect(action.docRequest.relatedObject).toEqual({
          involvement: 'OWNER',
          objectReferenceType: 'CONTRACT',
          objectReferenceId: 'ref-1',
        });
        done();
      });

      actions$.next(DocumentCreateActions.submitClicked());
    });

    it('should use undefined for mimeTypeId when attachment mimeTypeId is null', (done) => {
      const source = {
        details: {
          name: 'Doc',
          type: 'type-1',
          channel: 'ch-1',
          status: 'Draft',
          description: null,
          version: null,
          involvement: null,
          objectReferenceType: null,
          objectReferenceId: null,
        },
        attachments: [
          {
            name: null,
            description: null,
            mimeTypeId: null,
            validForEnd: null,
            fileName: 'file.pdf',
            file: new File(['content'], 'file.pdf'),
          },
        ],
        characteristics: [{ id: 'existing-id', name: 'color', value: 'red' }],
      };
      store.overrideSelector(
        selectDocumentCreateSubmissionSource,
        source as any
      );
      store.refreshState();

      effects.submitDocumentCreation$.pipe(take(1)).subscribe((action: any) => {
        expect(action.docRequest.attachments[0].mimeTypeId).toBeUndefined();
        expect(action.docRequest.characteristics[0].id).toBe('existing-id');
        done();
      });

      actions$.next(DocumentCreateActions.submitClicked());
    });
  });
});
