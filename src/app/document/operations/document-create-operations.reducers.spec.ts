import { DocumentCreateOperationsActions } from './document-create-operations.actions';
import {
  documentCreateOperationsReducer,
  initialState,
} from './document-create-operations.reducers';

describe('DocumentCreateOperationsReducer', () => {
  describe('availableDocumentTypesReceived', () => {
    it('should store document types', () => {
      const types = [{ id: 't1', name: 'Invoice' }] as any;
      const state = documentCreateOperationsReducer(
        initialState,
        DocumentCreateOperationsActions.availableDocumentTypesReceived({ types })
      );
      expect(state.availableDocumentTypes).toEqual(types);
    });
  });

  describe('availableMimeTypesReceived', () => {
    it('should store mime types', () => {
      const mimeTypes = [{ id: 'm1', name: 'application/pdf' }] as any;
      const state = documentCreateOperationsReducer(
        initialState,
        DocumentCreateOperationsActions.availableMimeTypesReceived({ mimeTypes })
      );
      expect(state.availableMimeTypes).toEqual(mimeTypes);
    });
  });

  describe('requestDocumentUploadUrls', () => {
    it('should set pendingAttachmentUploads to files count and reset id arrays', () => {
      const preState = {
        ...initialState,
        successfulAttachmentIds: ['old-1'],
        failedAttachmentIds: ['old-2'],
      };
      const files = [{} as any, {} as any];
      const state = documentCreateOperationsReducer(
        preState,
        DocumentCreateOperationsActions.requestDocumentUploadUrls({
          createdDocument: {} as any,
          uploadRequests: [],
          files,
        })
      );
      expect(state.pendingAttachmentUploads).toBe(2);
      expect(state.successfulAttachmentIds).toEqual([]);
      expect(state.failedAttachmentIds).toEqual([]);
    });
  });

  describe('uploadAttachmentSuccess', () => {
    it('should add attachmentId to successfulIds and decrement pending count', () => {
      const preState = {
        ...initialState,
        pendingAttachmentUploads: 2,
        successfulAttachmentIds: [],
      };
      const state = documentCreateOperationsReducer(
        preState,
        DocumentCreateOperationsActions.uploadAttachmentSuccess({
          documentId: 'doc-1',
          attachmentId: 'att-1',
        })
      );
      expect(state.successfulAttachmentIds).toContain('att-1');
      expect(state.pendingAttachmentUploads).toBe(1);
    });
  });

  describe('attachmentUploadFailed', () => {
    it('should add attachmentId to failedIds and decrement pending count', () => {
      const preState = {
        ...initialState,
        pendingAttachmentUploads: 3,
        failedAttachmentIds: [],
      };
      const state = documentCreateOperationsReducer(
        preState,
        DocumentCreateOperationsActions.attachmentUploadFailed({
          documentId: 'doc-1',
          attachmentId: 'att-2',
        })
      );
      expect(state.failedAttachmentIds).toContain('att-2');
      expect(state.pendingAttachmentUploads).toBe(2);
    });
  });

  describe('terminal actions reset upload tracking', () => {
    const dirtyState = {
      ...initialState,
      availableDocumentTypes: [{ id: 't1' }] as any,
      availableMimeTypes: [{ id: 'm1' }] as any,
      pendingAttachmentUploads: 1,
      successfulAttachmentIds: ['att-ok'],
      failedAttachmentIds: ['att-fail'],
    };

    const terminalActions = [
      DocumentCreateOperationsActions.documentCreationCompleted({ documentId: '1' }),
      DocumentCreateOperationsActions.documentCreationFinalStepFailed({ documentId: '1' }),
      DocumentCreateOperationsActions.documentCreationFailed(),
    ];

    terminalActions.forEach((action) => {
      it(`should reset upload tracking while keeping reference data on ${action.type}`, () => {
        const state = documentCreateOperationsReducer(dirtyState, action);
        expect(state.pendingAttachmentUploads).toBe(0);
        expect(state.successfulAttachmentIds).toEqual([]);
        expect(state.failedAttachmentIds).toEqual([]);
        expect(state.availableDocumentTypes).toEqual(dirtyState.availableDocumentTypes);
        expect(state.availableMimeTypes).toEqual(dirtyState.availableMimeTypes);
      });
    });
  });

  describe('loadReferenceDataFailed', () => {
    it('should reset to initialState', () => {
      const dirtyState = {
        availableDocumentTypes: [{ id: 't1' }] as any,
        availableMimeTypes: [{ id: 'm1' }] as any,
        pendingAttachmentUploads: 2,
        successfulAttachmentIds: ['att-1'],
        failedAttachmentIds: ['att-2'],
      };
      const state = documentCreateOperationsReducer(
        dirtyState,
        DocumentCreateOperationsActions.loadReferenceDataFailed({ error: 'err' })
      );
      expect(state).toEqual(initialState);
    });
  });
});
