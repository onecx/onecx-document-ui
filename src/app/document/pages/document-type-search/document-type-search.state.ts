import {
  DataTableColumn,
  InteractiveDataViewComponentState,
  SearchHeaderComponentState
} from '@onecx/angular-accelerator'
import { DocumentType } from 'src/app/shared/generated'

export interface DocumentTypeSearchState {
  columns: DataTableColumn[]
  results: DocumentType[]
  loadingIndicator: boolean
  resultComponentState: InteractiveDataViewComponentState | null
  searchHeaderComponentState: SearchHeaderComponentState | null
  dialogVisible: boolean
  editingDocumentType: DocumentType | null
}
