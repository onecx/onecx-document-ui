import { createSelector } from '@ngrx/store'
import { createChildSelectors } from '@onecx/ngrx-accelerator'
import { RowListGridData } from '@onecx/portal-integration-angular'
import { DocumentType } from 'src/app/shared/generated'
import { documentFeature } from '../../document.reducers'
import { initialState } from './document-type-search.reducers'
import { DocumentTypeSearchViewModel } from './document-type-search.viewmodel'

export const documentTypeSearchSelectors = createChildSelectors(documentFeature.selectDocumentTypes, initialState)

export const selectResults = createSelector(
  documentTypeSearchSelectors.selectResults,
  (results: DocumentType[]): RowListGridData[] =>
    results.map((item) => ({
      imagePath: '',
      ...item,
      id: item.id!
    }))
)

export const selectDocumentTypeSearchViewModel = createSelector(
  documentTypeSearchSelectors.selectColumns,
  selectResults,
  documentTypeSearchSelectors.selectLoadingIndicator,
  documentTypeSearchSelectors.selectResultComponentState,
  documentTypeSearchSelectors.selectSearchHeaderComponentState,
  documentTypeSearchSelectors.selectDialogVisible,
  documentTypeSearchSelectors.selectEditingDocumentType,
  (
    columns,
    results,
    loadingIndicator,
    resultComponentState,
    searchHeaderComponentState,
    dialogVisible,
    editingDocumentType
  ): DocumentTypeSearchViewModel => ({
    columns,
    results,
    loadingIndicator,
    resultComponentState,
    searchHeaderComponentState,
    dialogVisible,
    editingDocumentType
  })
)
