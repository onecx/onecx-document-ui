import { createActionGroup, emptyProps, props } from '@ngrx/store'

import { InteractiveDataViewComponentState, SearchHeaderComponentState } from '@onecx/portal-integration-angular'

import { DocumentType } from 'src/app/shared/generated'

export const DocumentTypeSearchActions = createActionGroup({
  source: 'DocumentTypeSearch',
  events: {
    'Load document types triggered': emptyProps(),
    'Document types received': props<{ documentTypes: DocumentType[] }>(),
    'Document types loading failed': props<{ error: string | null }>(),

    'Create document type button clicked': props<{
      name: string
      description?: string
      activeStatus?: boolean
    }>(),
    'Document type created': props<{ documentType: DocumentType }>(),
    'Document type creation failed': props<{ error: string | null }>(),

    'Edit document type button clicked': props<{
      documentType: DocumentType
    }>(),
    'Update document type button clicked': props<{
      id: string
      name: string
      description?: string
      activeStatus?: boolean
    }>(),
    'Document type updated': props<{ documentType: DocumentType }>(),
    'Document type update failed': props<{ error: string | null }>(),

    'Delete document type button clicked': props<{ id: string }>(),
    'Document type deleted': props<{ id: string }>(),
    'Document type deletion failed': props<{ error: string | null }>(),

    'Create dialog opened': emptyProps(),
    'Dialog closed': emptyProps(),

    'Result component state changed': props<InteractiveDataViewComponentState>(),
    'Search header component state changed': props<SearchHeaderComponentState>(),
    'Navigate back button clicked': emptyProps()
  }
})
