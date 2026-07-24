import { SelectItem } from 'primeng/api'

import {
  DataTableColumn,
  DiagramComponentState,
  InteractiveDataViewComponentState,
  RowListGridData,
  SearchHeaderComponentState
} from '@onecx/portal-integration-angular'

import { DocumentSearchCriteriaSchema } from './document-search.parameters'

export interface DocumentSearchViewModel {
  columns: DataTableColumn[]
  searchCriteria: DocumentSearchCriteriaSchema
  results: RowListGridData[]
  resultComponentState: InteractiveDataViewComponentState | null
  searchHeaderComponentState: SearchHeaderComponentState | null
  diagramComponentState: DiagramComponentState | null
  chartVisible: boolean
  searchLoadingIndicator: boolean
  searchExecuted: boolean
  criteriaOptionsLoaded: boolean
  availableDocumentTypes: SelectItem[]
  avilableChannels: SelectItem[]
}
