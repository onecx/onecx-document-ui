import * as selectors from './document-details.selectors'

describe('DocumentDetails selectors', () => {
  describe('selectDocumentTypes projector', () => {
    it('should map DocumentType[] to SelectItem[] with label=name and value=id', () => {
      const types = [
        { id: 't1', name: 'Invoice' },
        { id: 't2', name: 'Contract' }
      ] as any

      const result = selectors.selectDocumentTypes.projector(types)

      expect(result).toEqual([
        { label: 'Invoice', value: 't1' },
        { label: 'Contract', value: 't2' }
      ])
    })

    it('should return empty array when no document types are available', () => {
      const result = selectors.selectDocumentTypes.projector([])
      expect(result).toEqual([])
    })
  })

  describe('selectMimeTypes projector', () => {
    it('should map SupportedMimeType[] to SelectItem[] with label=name and value=id', () => {
      const mimeTypes = ['application/pdf', 'image/png'] as any

      const result = selectors.selectMimeTypes.projector(mimeTypes)

      expect(result).toEqual([
        { label: 'application/pdf', value: 'application/pdf' },
        { label: 'image/png', value: 'image/png' }
      ])
    })

    it('should return empty array when no mime types are available', () => {
      const result = selectors.selectMimeTypes.projector([])
      expect(result).toEqual([])
    })
  })

  describe('selectDocumentDetailsViewModel projector', () => {
    it('should combine all fields into DocumentDetailsViewModel', () => {
      const details = { id: '1', name: 'Doc' } as any

      const result = selectors.selectDocumentDetailsViewModel.projector(details, false, true, true, false, false)

      expect(result).toEqual({
        details,
        detailsLoadingIndicator: false,
        backNavigationPossible: true,
        detailsLoaded: true,
        editMode: false,
        isSubmitting: false
      })
    })

    it('should reflect editMode=true and isSubmitting=true when in submitting state', () => {
      const result = selectors.selectDocumentDetailsViewModel.projector(undefined, true, false, false, true, true)

      expect(result.editMode).toBe(true)
      expect(result.isSubmitting).toBe(true)
      expect(result.detailsLoadingIndicator).toBe(true)
      expect(result.backNavigationPossible).toBe(false)
    })
  })
})
