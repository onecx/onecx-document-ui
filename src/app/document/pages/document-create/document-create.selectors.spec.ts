import { DocumentCreateStep } from '../../types/document-create-step.enum';
import { initialState } from './document-create.reducers';
import {
  selectCanGoNextFromAttachments,
  selectCreateDocumentTypes,
  selectCreateMimeTypes,
  selectDocumentCreateSubmissionSource,
  selectDocumentCreateViewModel,
} from './document-create.selectors';

describe('DocumentCreateSelectors', () => {
  describe('selectCreateDocumentTypes', () => {
    it('should map DocumentType[] to SelectItem[] with label=name and value=id', () => {
      const types = [{ id: 't1', name: 'Invoice' }] as any;
      const result = selectCreateDocumentTypes.projector(types);
      expect(result).toEqual([{ label: 'Invoice', value: 't1' }]);
    });

    it('should return empty array when no types available', () => {
      expect(selectCreateDocumentTypes.projector([])).toEqual([]);
    });
  });

  describe('selectCreateMimeTypes', () => {
    it('should map SupportedMimeType[] to SelectItem[] with label=name and value=id', () => {
      const mimeTypes = [{ id: 'm1', name: 'application/pdf' }] as any;
      const result = selectCreateMimeTypes.projector(mimeTypes);
      expect(result).toEqual([{ label: 'application/pdf', value: 'm1' }]);
    });

    it('should return empty array when no mime types available', () => {
      expect(selectCreateMimeTypes.projector([])).toEqual([]);
    });
  });

  describe('selectDocumentCreateViewModel', () => {
    it('should combine all 8 selectors into a DocumentCreateViewModel', () => {
      const attachments = [{ fileName: 'doc.pdf' }] as any;
      const characteristics = [{ name: 'color', value: 'red' }] as any;
      const details = { name: 'My Doc' } as any;

      const result = selectDocumentCreateViewModel.projector(
        {
          activeStep: DocumentCreateStep.Attachments,
          details,
          attachments,
          characteristics,
        },
        {
          submitting: false,
          referenceDataLoading: true,
          referenceDataLoaded: false,
          error: 'some error',
        }
      );

      expect(result).toEqual({
        activeStep: DocumentCreateStep.Attachments,
        details,
        attachments,
        characteristics,
        submitting: false,
        referenceDataLoading: true,
        referenceDataLoaded: false,
        error: 'some error',
      });
    });

    it('should compose form and status slices from root state selector path', () => {
      const details = { name: 'Doc from state' } as any;
      const attachments = [{ fileName: 'state.pdf' }] as any;
      const characteristics = [{ name: 'k', value: 'v' }] as any;

      const state = {
        document: {
          create: {
            ...initialState,
            activeStep: DocumentCreateStep.Characteristics,
            details,
            attachments,
            characteristics,
            submitting: true,
            referenceDataLoading: false,
            referenceDataLoaded: true,
            error: 'state error',
          },
        },
      };

      expect(selectDocumentCreateViewModel(state as any)).toEqual({
        activeStep: DocumentCreateStep.Characteristics,
        details,
        attachments,
        characteristics,
        submitting: true,
        referenceDataLoading: false,
        referenceDataLoaded: true,
        error: 'state error',
      });
    });
  });

  describe('selectCanGoNextFromAttachments', () => {
    it('should return true when attachments array has at least one item', () => {
      const attachments = [{ fileName: 'file.pdf' }] as any;
      expect(selectCanGoNextFromAttachments.projector(attachments)).toBe(true);
    });

    it('should return false when attachments array is empty', () => {
      expect(selectCanGoNextFromAttachments.projector([])).toBe(false);
    });
  });

  describe('selectDocumentCreateSubmissionSource', () => {
    it('should combine details, attachments and characteristics into submission source', () => {
      const details = { name: 'Doc', type: 'type-1' } as any;
      const attachments = [{ fileName: 'file.pdf' }] as any;
      const characteristics = [{ name: 'color', value: 'blue' }] as any;

      const result = selectDocumentCreateSubmissionSource.projector(
        details,
        attachments,
        characteristics
      );

      expect(result).toEqual({ details, attachments, characteristics });
    });
  });
});
