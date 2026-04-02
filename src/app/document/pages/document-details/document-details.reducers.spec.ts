import { DocumentDetailsActions } from './document-details.actions';
import * as reducers from './document-details.reducers';

describe('DocumentDetailsReducer', () => {
  describe('navigatedToDetailsPage', () => {
    it('should reset to initialState with detailsLoadingIndicator=true', () => {
      const preState = {
        ...reducers.initialState,
        detailsLoaded: true,
        editMode: true,
        details: { id: '1' } as any,
      };
      const action = DocumentDetailsActions.navigatedToDetailsPage({
        id: '1',
      });
      const state = reducers.documentDetailsReducer(preState, action);
      expect(state.details).toBeUndefined();
      expect(state.detailsLoaded).toBe(false);
      expect(state.editMode).toBe(false);
      expect(state.detailsLoadingIndicator).toBe(true);
    });
  });

  describe('documentDetailsReceived', () => {
    it('should set details and set detailsLoaded=true, detailsLoadingIndicator=false', () => {
      const details = { id: '1', name: 'Doc' } as any;
      const action = DocumentDetailsActions.documentDetailsReceived({
        details,
      });
      const state = reducers.documentDetailsReducer(
        reducers.initialState,
        action
      );
      expect(state.details).toEqual(details);
      expect(state.detailsLoaded).toBe(true);
      expect(state.detailsLoadingIndicator).toBe(false);
    });
  });

  describe('documentDetailsLoadingFailed', () => {
    it('should clear details and set detailsLoaded=false, detailsLoadingIndicator=false', () => {
      const preState = {
        ...reducers.initialState,
        details: { id: '1' } as any,
        detailsLoadingIndicator: true,
        detailsLoaded: true,
      };
      const action = DocumentDetailsActions.documentDetailsLoadingFailed({
        error: 'error',
      });
      const state = reducers.documentDetailsReducer(preState, action);
      expect(state.details).toBeUndefined();
      expect(state.detailsLoaded).toBe(false);
      expect(state.detailsLoadingIndicator).toBe(false);
    });
  });

  describe('editButtonClicked', () => {
    it('should set editMode=true', () => {
      const action = DocumentDetailsActions.editButtonClicked();
      const state = reducers.documentDetailsReducer(
        reducers.initialState,
        action
      );
      expect(state.editMode).toBe(true);
    });
  });

  describe('saveButtonClicked', () => {
    it('should set isSubmitting=true', () => {
      const action = DocumentDetailsActions.saveButtonClicked({
        details: {} as any,
      });
      const state = reducers.documentDetailsReducer(
        reducers.initialState,
        action
      );
      expect(state.isSubmitting).toBe(true);
    });
  });

  describe('cancelEditConfirmClicked / cancelEditNotDirty / updateDocumentCancelled / updateDocumentSucceeded', () => {
    const actions = [
      DocumentDetailsActions.cancelEditConfirmClicked(),
      DocumentDetailsActions.cancelEditNotDirty(),
      DocumentDetailsActions.updateDocumentCancelled(),
      DocumentDetailsActions.updateDocumentSucceeded(),
    ];

    actions.forEach((action) => {
      it(`should set editMode=false and isSubmitting=false on ${action.type}`, () => {
        const preState = {
          ...reducers.initialState,
          editMode: true,
          isSubmitting: true,
        };
        const state = reducers.documentDetailsReducer(preState, action);
        expect(state.editMode).toBe(false);
        expect(state.isSubmitting).toBe(false);
      });
    });
  });

  describe('updateDocumentFailed', () => {
    it('should set isSubmitting=false', () => {
      const preState = { ...reducers.initialState, isSubmitting: true };
      const action = DocumentDetailsActions.updateDocumentFailed({
        error: 'fail',
      });
      const state = reducers.documentDetailsReducer(preState, action);
      expect(state.isSubmitting).toBe(false);
    });
  });
});
