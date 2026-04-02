import { DocumentCreateStep } from '../../types/document-create-step.enum';
import { DocumentCreateOperationsActions } from '../../operations/document-create-operations.actions';
import { DocumentCreateActions } from './document-create.actions';
import * as reducers from './document-create.reducers';

describe('DocumentCreateReducer', () => {
  describe('enteredPage', () => {
    it('should set referenceDataLoading=true when types and mimeTypes are not yet loaded', () => {
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateActions.enteredPage()
      );
      expect(state.referenceDataLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set referenceDataLoading=false when types and mimeTypes are already loaded', () => {
      const preState = {
        ...reducers.initialState,
        availableDocumentTypes: [{ id: 't1' }] as any,
        availableMimeTypes: [{ id: 'm1' }] as any,
      };
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateActions.enteredPage()
      );
      expect(state.referenceDataLoading).toBe(false);
    });
  });

  describe('goToNextStep', () => {
    it('should advance from Details to Attachments', () => {
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateActions.goToNextStep({
          currentStep: DocumentCreateStep.Details,
        })
      );
      expect(state.activeStep).toBe(DocumentCreateStep.Attachments);
    });

    it('should advance from Attachments to Characteristics', () => {
      const preState = {
        ...reducers.initialState,
        activeStep: DocumentCreateStep.Attachments,
      };
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateActions.goToNextStep({
          currentStep: DocumentCreateStep.Attachments,
        })
      );
      expect(state.activeStep).toBe(DocumentCreateStep.Characteristics);
    });
  });

  describe('goToPreviousStep', () => {
    it('should go back from Characteristics to Attachments', () => {
      const preState = {
        ...reducers.initialState,
        activeStep: DocumentCreateStep.Characteristics,
      };
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateActions.goToPreviousStep({
          currentStep: DocumentCreateStep.Characteristics,
        })
      );
      expect(state.activeStep).toBe(DocumentCreateStep.Attachments);
    });

    it('should go back from Attachments to Details', () => {
      const preState = {
        ...reducers.initialState,
        activeStep: DocumentCreateStep.Attachments,
      };
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateActions.goToPreviousStep({
          currentStep: DocumentCreateStep.Attachments,
        })
      );
      expect(state.activeStep).toBe(DocumentCreateStep.Details);
    });
  });

  describe('detailsStepPatched', () => {
    it('should merge new details into existing details', () => {
      const preState = {
        ...reducers.initialState,
        details: { name: 'Old Name' } as any,
      };
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateActions.detailsStepPatched({
          details: { name: 'New Name', type: 'type-1' },
        })
      );
      expect(state.details?.name).toBe('New Name');
      expect(state.details?.type).toBe('type-1');
    });

    it('should set details from null when first patched', () => {
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateActions.detailsStepPatched({ details: { name: 'Doc' } })
      );
      expect(state.details?.name).toBe('Doc');
    });
  });

  describe('attachmentsStepPatched', () => {
    it('should replace attachments array', () => {
      const attachments = [
        { fileName: 'a.pdf', file: new File([], 'a.pdf') },
      ] as any;
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateActions.attachmentsStepPatched({ attachments })
      );
      expect(state.attachments).toEqual(attachments);
    });
  });

  describe('characteristicsStepPatched', () => {
    it('should replace characteristics array', () => {
      const characteristics = [{ name: 'color', value: 'red' }] as any;
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateActions.characteristicsStepPatched({ characteristics })
      );
      expect(state.characteristics).toEqual(characteristics);
    });
  });

  describe('submitClicked', () => {
    it('should set submitting=true', () => {
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateActions.submitClicked()
      );
      expect(state.submitting).toBe(true);
    });
  });

  describe('submitFinished', () => {
    it('should set submitting=false', () => {
      const preState = { ...reducers.initialState, submitting: true };
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateActions.submitFinished()
      );
      expect(state.submitting).toBe(false);
    });
  });

  describe('stepValidationFailed', () => {
    it('should set error message', () => {
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateActions.stepValidationFailed({
          error: 'VALIDATION_ERROR',
        })
      );
      expect(state.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('clearError', () => {
    it('should reset error to null', () => {
      const preState = { ...reducers.initialState, error: 'some error' };
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateActions.clearError()
      );
      expect(state.error).toBeNull();
    });
  });

  describe('resetClicked', () => {
    it('should return to initial state', () => {
      const dirtyState = {
        ...reducers.initialState,
        details: { name: 'Doc' } as any,
        submitting: true,
        activeStep: DocumentCreateStep.Characteristics,
      };
      const state = reducers.documentCreateReducer(
        dirtyState,
        DocumentCreateActions.resetClicked()
      );
      expect(state).toEqual(reducers.initialState);
    });
  });

  describe('availableDocumentTypesReceived', () => {
    it('should set availableDocumentTypes and referenceDataLoaded=true when mimeTypes also present', () => {
      const preState = {
        ...reducers.initialState,
        availableMimeTypes: [{ id: 'm1' }] as any,
      };
      const types = [{ id: 't1', name: 'Invoice' }] as any;
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateOperationsActions.availableDocumentTypesReceived({
          types,
        })
      );
      expect(state.availableDocumentTypes).toEqual(types);
      expect(state.referenceDataLoaded).toBe(true);
      expect(state.referenceDataLoading).toBe(false);
    });

    it('should set referenceDataLoading=true when mimeTypes not yet available', () => {
      const types = [{ id: 't1' }] as any;
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateOperationsActions.availableDocumentTypesReceived({
          types,
        })
      );
      expect(state.referenceDataLoading).toBe(true);
      expect(state.referenceDataLoaded).toBe(false);
    });
  });

  describe('availableMimeTypesReceived', () => {
    it('should set availableMimeTypes and referenceDataLoaded=true when types also present', () => {
      const preState = {
        ...reducers.initialState,
        availableDocumentTypes: [{ id: 't1' }] as any,
      };
      const mimeTypes = [{ id: 'm1', name: 'application/pdf' }] as any;
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateOperationsActions.availableMimeTypesReceived({
          mimeTypes,
        })
      );
      expect(state.availableMimeTypes).toEqual(mimeTypes);
      expect(state.referenceDataLoaded).toBe(true);
      expect(state.referenceDataLoading).toBe(false);
    });
  });

  describe('loadReferenceDataFailed', () => {
    it('should set referenceDataLoading=false, referenceDataLoaded=false and store error', () => {
      const state = reducers.documentCreateReducer(
        reducers.initialState,
        DocumentCreateOperationsActions.loadReferenceDataFailed({
          error: 'LOAD_FAILED',
        })
      );
      expect(state.referenceDataLoading).toBe(false);
      expect(state.referenceDataLoaded).toBe(false);
      expect(state.error).toBe('LOAD_FAILED');
    });
  });

  describe('documentCreationCompleted / documentCreationFailed / documentCreationFinalStepFailed', () => {
    const actions = [
      DocumentCreateOperationsActions.documentCreationCompleted({
        documentId: '1',
      }),
      DocumentCreateOperationsActions.documentCreationFailed(),
      DocumentCreateOperationsActions.documentCreationFinalStepFailed({
        documentId: '1',
      }),
    ];

    actions.forEach((action) => {
      it(`should set submitting=false on ${action.type}`, () => {
        const preState = { ...reducers.initialState, submitting: true };
        const state = reducers.documentCreateReducer(preState, action);
        expect(state.submitting).toBe(false);
      });
    });
  });

  describe('ensureReferenceDataLoaded', () => {
    it('should set referenceDataLoading=false when referenceDataLoaded is already true', () => {
      const preState = { ...reducers.initialState, referenceDataLoaded: true };
      const state = reducers.documentCreateReducer(
        preState,
        DocumentCreateOperationsActions.ensureReferenceDataLoaded()
      );
      expect(state.referenceDataLoading).toBe(false);
    });
  });
});
