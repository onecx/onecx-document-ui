import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import {
  documentQuickUploadReducer,
  initialState,
} from './document-quick-upload.reducers';

describe('DocumentQuickUploadReducer', () => {
  describe('ensureReferenceDataLoaded', () => {
    it('should set optionsLoading=true when neither types nor mimeTypes are loaded', () => {
      const state = documentQuickUploadReducer(
        initialState,
        DocumentCreateOperationsActions.ensureReferenceDataLoaded()
      );
      expect(state.optionsLoading).toBe(true);
    });

    it('should set optionsLoading=false when both types and mimeTypes are already loaded', () => {
      const preState = {
        ...initialState,
        mimeTypesLoaded: true,
        documentTypesLoaded: true,
      };
      const state = documentQuickUploadReducer(
        preState,
        DocumentCreateOperationsActions.ensureReferenceDataLoaded()
      );
      expect(state.optionsLoading).toBe(false);
    });
  });

  describe('availableDocumentTypesReceived', () => {
    it('should set documentTypesLoaded=true and keep optionsLoading=true when mimeTypes not yet loaded', () => {
      const types = [{ id: 't1', name: 'Invoice' }] as any;
      const state = documentQuickUploadReducer(
        initialState,
        DocumentCreateOperationsActions.availableDocumentTypesReceived({
          types,
        })
      );
      expect(state.documentTypesLoaded).toBe(true);
      expect(state.optionsLoading).toBe(true);
    });

    it('should set optionsLoading=false when mimeTypes are already loaded', () => {
      const preState = { ...initialState, mimeTypesLoaded: true };
      const types = [{ id: 't1' }] as any;
      const state = documentQuickUploadReducer(
        preState,
        DocumentCreateOperationsActions.availableDocumentTypesReceived({
          types,
        })
      );
      expect(state.optionsLoading).toBe(false);
    });
  });

  describe('availableMimeTypesReceived', () => {
    it('should set mimeTypesLoaded=true and keep optionsLoading=true when types not yet loaded', () => {
      const mimeTypes = [{ id: 'm1', name: 'application/pdf' }] as any;
      const state = documentQuickUploadReducer(
        initialState,
        DocumentCreateOperationsActions.availableMimeTypesReceived({
          mimeTypes,
        })
      );
      expect(state.mimeTypesLoaded).toBe(true);
      expect(state.optionsLoading).toBe(true);
    });

    it('should set optionsLoading=false when document types are already loaded', () => {
      const preState = { ...initialState, documentTypesLoaded: true };
      const mimeTypes = [{ id: 'm1' }] as any;
      const state = documentQuickUploadReducer(
        preState,
        DocumentCreateOperationsActions.availableMimeTypesReceived({
          mimeTypes,
        })
      );
      expect(state.optionsLoading).toBe(false);
    });
  });

  describe('startDocumentCreation', () => {
    it('should set optionsLoading=true', () => {
      const state = documentQuickUploadReducer(
        initialState,
        DocumentCreateOperationsActions.startDocumentCreation({
          docRequest: {} as any,
          files: [],
        })
      );
      expect(state.optionsLoading).toBe(true);
    });
  });

  describe('terminal actions reset to initial state', () => {
    const dirtyState = {
      optionsLoading: true,
      mimeTypesLoaded: true,
      documentTypesLoaded: true,
    };

    const terminalActions = [
      DocumentCreateOperationsActions.documentCreationCompleted({
        documentId: '1',
      }),
      DocumentCreateOperationsActions.documentCreationFinalStepFailed({
        documentId: '1',
      }),
      DocumentCreateOperationsActions.documentCreationFailed(),
      DocumentCreateOperationsActions.loadReferenceDataFailed({ error: 'err' }),
    ];

    terminalActions.forEach((action) => {
      it(`should reset to initialState on ${action.type}`, () => {
        const state = documentQuickUploadReducer(dirtyState, action);
        expect(state).toEqual(initialState);
      });
    });
  });
});
