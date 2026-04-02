import {
  selectOperationsDocumentTypes,
  selectOperationsMimeTypes,
} from './document-create-operations.selectors';

describe('DocumentCreateOperationsSelectors', () => {
  describe('selectOperationsDocumentTypes', () => {
    it('should map DocumentType[] to SelectItem[] with label=name and value=id', () => {
      const types = [
        { id: 't1', name: 'Invoice' },
        { id: 't2', name: 'Contract' },
      ] as any;
      const result = selectOperationsDocumentTypes.projector(types);
      expect(result).toEqual([
        { label: 'Invoice', value: 't1' },
        { label: 'Contract', value: 't2' },
      ]);
    });

    it('should return empty array when types array is empty', () => {
      expect(selectOperationsDocumentTypes.projector([])).toEqual([]);
    });
  });

  describe('selectOperationsMimeTypes', () => {
    it('should map SupportedMimeType[] to SelectItem[] with label=name and value=id', () => {
      const mimeTypes = [
        { id: 'm1', name: 'application/pdf' },
        { id: 'm2', name: 'image/png' },
      ] as any;
      const result = selectOperationsMimeTypes.projector(mimeTypes);
      expect(result).toEqual([
        { label: 'application/pdf', value: 'm1' },
        { label: 'image/png', value: 'm2' },
      ]);
    });

    it('should return empty array when mimeTypes array is empty', () => {
      expect(selectOperationsMimeTypes.projector([])).toEqual([]);
    });
  });
});
