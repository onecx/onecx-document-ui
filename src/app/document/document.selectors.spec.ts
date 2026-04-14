import { selectDocumentFeature } from './document.selectors';

describe('document.selectors', () => {
  it('should select document feature slice when root state contains document key', () => {
    const documentState = {
      create: {},
      details: {},
      operations: {},
      quickUpload: {},
      search: {},
    };

    const state = {
      document: documentState,
    };

    expect(selectDocumentFeature(state as any)).toBe(documentState);
  });
});
