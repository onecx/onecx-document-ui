import { createSelector } from '@ngrx/store'
import { createChildSelectors } from '@onecx/ngrx-accelerator'
import { SelectItem } from 'primeng/api'
import { documentFeature } from '../document.reducers'
import { initialState } from './document-create-operations.reducers'

export const documentCreateOperationsSelectors = createChildSelectors(documentFeature.selectOperations, initialState)

export const selectOperationsDocumentTypes = createSelector(
  documentCreateOperationsSelectors.selectAvailableDocumentTypes,
  (types): SelectItem[] =>
    types.map((type) => ({
      label: type.name,
      value: type.id
    }))
)

export const selectOperationsMimeTypes = createSelector(
  documentCreateOperationsSelectors.selectAvailableMimeTypes,
  (mimeTypes: string[]): SelectItem[] =>
    mimeTypes.map((mimeType) => ({
      label: mimeType,
      value: mimeType
    }))
)
