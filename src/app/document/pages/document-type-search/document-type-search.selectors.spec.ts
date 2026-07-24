import { ColumnType } from '@onecx/angular-accelerator'
import * as selectors from './document-type-search.selectors'
import { selectResults } from './document-type-search.selectors'

const mockColumns = [
  {
    id: 'name',
    nameKey: 'DOCUMENT_TYPE_SEARCH.RESULTS.NAME_COLUMN',
    columnType: ColumnType.STRING
  }
]

describe('DocumentTypeSearch selectors', () => {
  describe('selectResults projector', () => {
    it('should map DocumentType[] to RowListGridData[] with imagePath set to empty string', () => {
      const input = [
        { id: '1', name: 'Invoice', description: 'Desc', activeStatus: true },
        {
          id: '2',
          name: 'Contract',
          description: 'Other',
          activeStatus: false
        }
      ] as any

      const result = selectResults.projector(input)

      expect(result).toEqual([
        {
          imagePath: '',
          id: '1',
          name: 'Invoice',
          description: 'Desc',
          activeStatus: true
        },
        {
          imagePath: '',
          id: '2',
          name: 'Contract',
          description: 'Other',
          activeStatus: false
        }
      ])
    })

    it('should return empty array when results is empty', () => {
      const result = selectResults.projector([])
      expect(result).toEqual([])
    })

    it('should use item.id as the id in RowListGridData', () => {
      const input = [{ id: 'abc', name: 'Test' }] as any
      const result = selectResults.projector(input)
      expect(result[0].id).toBe('abc')
    })
  })

  describe('selectDocumentTypeSearchViewModel projector', () => {
    it('should combine all selector results into DocumentTypeSearchViewModel', () => {
      const results = [{ imagePath: '', id: '1', name: 'Invoice' }] as any
      const editingDocumentType = { id: '1', name: 'Invoice' } as any

      const result = selectors.selectDocumentTypeSearchViewModel.projector(
        mockColumns,
        results,
        true,
        null,
        null,
        true,
        editingDocumentType
      )

      expect(result).toEqual({
        columns: mockColumns,
        results,
        loadingIndicator: true,
        resultComponentState: null,
        searchHeaderComponentState: null,
        dialogVisible: true,
        editingDocumentType
      })
    })

    it('should set dialogVisible to false and editingDocumentType to null when no dialog is open', () => {
      const result = selectors.selectDocumentTypeSearchViewModel.projector(
        mockColumns,
        [],
        false,
        null,
        null,
        false,
        null
      )

      expect(result.dialogVisible).toBe(false)
      expect(result.editingDocumentType).toBeNull()
    })

    it('should pass resultComponentState and searchHeaderComponentState through', () => {
      const resultComponentState = { layout: 'list' } as any
      const searchHeaderComponentState = { activeViewMode: 'basic' } as any

      const result = selectors.selectDocumentTypeSearchViewModel.projector(
        mockColumns,
        [],
        false,
        resultComponentState,
        searchHeaderComponentState,
        false,
        null
      )

      expect(result.resultComponentState).toEqual(resultComponentState)
      expect(result.searchHeaderComponentState).toEqual(searchHeaderComponentState)
    })

    it('should pass loadingIndicator=false when not loading', () => {
      const result = selectors.selectDocumentTypeSearchViewModel.projector(
        mockColumns,
        [],
        false,
        null,
        null,
        false,
        null
      )

      expect(result.loadingIndicator).toBe(false)
    })
  })
})
