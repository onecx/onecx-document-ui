import { createSelector } from '@ngrx/store';
import { createChildSelectors } from '@onecx/ngrx-accelerator';
import { RowListGridData } from '@onecx/portal-integration-angular';
import {
  Channel,
  DocumentDetail,
  DocumentType,
} from '../../../shared/generated';
import { documentFeature } from '../../document.reducers';
import { initialState } from './document-search.reducers';
import { DocumentSearchViewModel } from './document-search.viewmodel';
import { SelectItem } from 'primeng/api';

export const documentSearchSelectors = createChildSelectors(
  documentFeature.selectSearch,
  initialState
);

export const selectResults = createSelector(
  documentSearchSelectors.selectResults,
  (results: DocumentDetail[]): RowListGridData[] => {
    return results.map((item) => ({
      imagePath: '',
      ...item,
      id: item.id!,
      typeName: item.type?.name,
    }));
  }
);

const selectDocumentTypes = createSelector(
  documentSearchSelectors.selectAvailableDocumentTypes,
  (docTypes: DocumentType[]): SelectItem[] => {
    return docTypes.map((type) => ({ label: type.name, value: type.id }));
  }
);

const selectChannels = createSelector(
  documentSearchSelectors.selectAvailableChannels,
  (channels: Channel[]): SelectItem[] => {
    return channels.map((channel) => ({
      label: channel.name,
      value: channel.id,
    }));
  }
);

const selectDocumentSearchResultState = createSelector(
  documentSearchSelectors.selectColumns,
  documentSearchSelectors.selectCriteria,
  selectResults,
  documentSearchSelectors.selectResultComponentState,
  documentSearchSelectors.selectSearchHeaderComponentState,
  documentSearchSelectors.selectDiagramComponentState,
  (
    columns,
    searchCriteria,
    results,
    resultComponentState,
    searchHeaderComponentState,
    diagramComponentState
  ) => ({
    columns,
    searchCriteria,
    results,
    resultComponentState,
    searchHeaderComponentState,
    diagramComponentState,
  })
);

const selectDocumentSearchStatusState = createSelector(
  documentSearchSelectors.selectChartVisible,
  documentSearchSelectors.selectSearchLoadingIndicator,
  documentSearchSelectors.selectSearchExecuted,
  documentSearchSelectors.selectCriteriaOptionsLoaded,
  selectDocumentTypes,
  selectChannels,
  (
    chartVisible,
    searchLoadingIndicator,
    searchExecuted,
    criteriaOptionsLoaded,
    availableDocumentTypes,
    avilableChannels
  ) => ({
    chartVisible,
    searchLoadingIndicator,
    searchExecuted,
    criteriaOptionsLoaded,
    availableDocumentTypes,
    avilableChannels,
  })
);

export const selectDocumentSearchViewModel = createSelector(
  selectDocumentSearchResultState,
  selectDocumentSearchStatusState,
  (resultState, statusState): DocumentSearchViewModel => ({
    ...resultState,
    ...statusState,
  })
);
