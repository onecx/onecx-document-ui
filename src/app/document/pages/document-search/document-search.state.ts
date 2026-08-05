import {
  DataTableColumn,
  DiagramComponentState,
  InteractiveDataViewComponentState,
  SearchHeaderComponentState
} from '@onecx/angular-accelerator'

import { Channel, DocumentDetail, DocumentType } from 'src/app/shared/generated'
import { DocumentSearchCriteriaSchema } from './document-search.parameters'

export interface DocumentSearchState {
  columns: DataTableColumn[]
  results: DocumentDetail[]
  chartVisible: boolean
  resultComponentState: InteractiveDataViewComponentState | null
  searchHeaderComponentState: SearchHeaderComponentState | null
  diagramComponentState: DiagramComponentState | null
  searchLoadingIndicator: boolean
  criteria: DocumentSearchCriteriaSchema
  searchExecuted: boolean
  criteriaOptionsLoaded: boolean
  availableDocumentTypes: DocumentType[]
  availableChannels: Channel[]
}
