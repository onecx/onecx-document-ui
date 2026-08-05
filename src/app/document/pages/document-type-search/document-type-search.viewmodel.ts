import {
  DataTableColumn,
  InteractiveDataViewComponentState,
  RowListGridData,
  SearchHeaderComponentState
} from '@onecx/angular-accelerator'
import { DocumentType } from 'src/app/shared/generated'

export interface DocumentTypeSearchViewModel {
  columns: DataTableColumn[]
  results: RowListGridData[]
  loadingIndicator: boolean
  resultComponentState: InteractiveDataViewComponentState | null
  searchHeaderComponentState: SearchHeaderComponentState | null
  dialogVisible: boolean
  editingDocumentType: DocumentType | null
}
