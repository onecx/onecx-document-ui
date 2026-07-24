import { DocumentTypeSearchActions } from './document-type-search.actions'
import { documentTypeSearchColumns } from './document-type-search.columns'
import * as reducers from './document-type-search.reducers'

const mockDocumentType = {
  id: '1',
  name: 'Invoice',
  description: 'Desc',
  activeStatus: true
}

describe('DocumentTypeSearchReducer', () => {
  describe('loadDocumentTypesTriggered', () => {
    it('should set loadingIndicator to true', () => {
      const action = DocumentTypeSearchActions.loadDocumentTypesTriggered()
      const state = reducers.documentTypeSearchReducer(reducers.initialState, action)
      expect(state.loadingIndicator).toBe(true)
    })
  })

  describe('documentTypesReceived', () => {
    it('should set results and set loadingIndicator to false', () => {
      const preState = { ...reducers.initialState, loadingIndicator: true }
      const action = DocumentTypeSearchActions.documentTypesReceived({
        documentTypes: [mockDocumentType]
      })
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.results).toEqual([mockDocumentType])
      expect(state.loadingIndicator).toBe(false)
    })

    it('should set results to empty array and loadingIndicator to false when empty array received', () => {
      const action = DocumentTypeSearchActions.documentTypesReceived({
        documentTypes: []
      })
      const state = reducers.documentTypeSearchReducer(reducers.initialState, action)
      expect(state.results).toEqual([])
      expect(state.loadingIndicator).toBe(false)
    })
  })

  describe('documentTypesLoadingFailed', () => {
    it('should clear results and set loadingIndicator to false', () => {
      const preState = {
        ...reducers.initialState,
        results: [mockDocumentType],
        loadingIndicator: true
      }
      const action = DocumentTypeSearchActions.documentTypesLoadingFailed({
        error: 'error'
      })
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.results).toEqual([])
      expect(state.loadingIndicator).toBe(false)
    })
  })

  describe('createDialogOpened', () => {
    it('should set dialogVisible to true and editingDocumentType to null', () => {
      const preState = {
        ...reducers.initialState,
        dialogVisible: false,
        editingDocumentType: mockDocumentType
      }
      const action = DocumentTypeSearchActions.createDialogOpened()
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.dialogVisible).toBe(true)
      expect(state.editingDocumentType).toBeNull()
    })
  })

  describe('editDocumentTypeButtonClicked', () => {
    it('should set dialogVisible to true and editingDocumentType to the given documentType', () => {
      const action = DocumentTypeSearchActions.editDocumentTypeButtonClicked({
        documentType: mockDocumentType
      })
      const state = reducers.documentTypeSearchReducer(reducers.initialState, action)
      expect(state.dialogVisible).toBe(true)
      expect(state.editingDocumentType).toEqual(mockDocumentType)
    })
  })

  describe('dialogClosed', () => {
    it('should set dialogVisible to false and editingDocumentType to null', () => {
      const preState = {
        ...reducers.initialState,
        dialogVisible: true,
        editingDocumentType: mockDocumentType
      }
      const action = DocumentTypeSearchActions.dialogClosed()
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.dialogVisible).toBe(false)
      expect(state.editingDocumentType).toBeNull()
    })
  })

  describe('documentTypeCreated', () => {
    it('should append the new documentType to results and close the dialog', () => {
      const preState = {
        ...reducers.initialState,
        results: [{ id: '0', name: 'Existing' }],
        dialogVisible: true,
        editingDocumentType: null
      }
      const action = DocumentTypeSearchActions.documentTypeCreated({
        documentType: mockDocumentType
      })
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.results).toHaveLength(2)
      expect(state.results[1]).toEqual(mockDocumentType)
      expect(state.dialogVisible).toBe(false)
      expect(state.editingDocumentType).toBeNull()
    })
  })

  describe('documentTypeUpdated', () => {
    it('should replace the matching documentType in results and close the dialog', () => {
      const updated = { ...mockDocumentType, name: 'Updated' }
      const preState = {
        ...reducers.initialState,
        results: [mockDocumentType, { id: '2', name: 'Other' }],
        dialogVisible: true,
        editingDocumentType: mockDocumentType
      }
      const action = DocumentTypeSearchActions.documentTypeUpdated({
        documentType: updated
      })
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.results[0]).toEqual(updated)
      expect(state.results[1]).toEqual({ id: '2', name: 'Other' })
      expect(state.dialogVisible).toBe(false)
      expect(state.editingDocumentType).toBeNull()
    })

    it('should not modify other entries when updating', () => {
      const other = { id: '2', name: 'Other' }
      const preState = {
        ...reducers.initialState,
        results: [mockDocumentType, other]
      }
      const action = DocumentTypeSearchActions.documentTypeUpdated({
        documentType: { ...mockDocumentType, name: 'Changed' }
      })
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.results[1]).toEqual(other)
    })
  })

  describe('documentTypeDeleted', () => {
    it('should remove the documentType with the given id from results', () => {
      const preState = {
        ...reducers.initialState,
        results: [mockDocumentType, { id: '2', name: 'Other' }]
      }
      const action = DocumentTypeSearchActions.documentTypeDeleted({ id: '1' })
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.results).toHaveLength(1)
      expect(state.results[0].id).toBe('2')
    })

    it('should not modify results when id does not match any entry', () => {
      const preState = {
        ...reducers.initialState,
        results: [mockDocumentType]
      }
      const action = DocumentTypeSearchActions.documentTypeDeleted({
        id: 'nonexistent'
      })
      const state = reducers.documentTypeSearchReducer(preState, action)
      expect(state.results).toHaveLength(1)
    })
  })

  describe('resultComponentStateChanged', () => {
    it('should update resultComponentState', () => {
      const resultComponentState = { layout: 'table' } as any
      const action = DocumentTypeSearchActions.resultComponentStateChanged(resultComponentState)
      const state = reducers.documentTypeSearchReducer(reducers.initialState, action)
      expect(state.resultComponentState).toEqual(expect.objectContaining(resultComponentState))
    })
  })

  describe('searchHeaderComponentStateChanged', () => {
    it('should update searchHeaderComponentState', () => {
      const searchHeaderComponentState = { activeViewMode: 'basic' } as any
      const action = DocumentTypeSearchActions.searchHeaderComponentStateChanged(searchHeaderComponentState)
      const state = reducers.documentTypeSearchReducer(reducers.initialState, action)
      expect(state.searchHeaderComponentState).toEqual(expect.objectContaining(searchHeaderComponentState))
    })
  })

  describe('initialState', () => {
    it('should have the correct initial values', () => {
      expect(reducers.initialState).toEqual({
        columns: documentTypeSearchColumns,
        results: [],
        loadingIndicator: false,
        resultComponentState: null,
        searchHeaderComponentState: null,
        dialogVisible: false,
        editingDocumentType: null
      })
    })
  })
})
