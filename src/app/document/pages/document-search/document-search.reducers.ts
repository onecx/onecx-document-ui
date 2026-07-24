import { routerNavigatedAction, RouterNavigatedAction } from '@ngrx/router-store'
import { createReducer, on } from '@ngrx/store'
import { DocumentSearchActions } from './document-search.actions'
import { documentSearchColumns } from './document-search.columns'
import { documentSearchCriteriasSchema } from './document-search.parameters'
import { DocumentSearchState } from './document-search.state'

export const initialState: DocumentSearchState = {
  columns: documentSearchColumns,
  results: [],
  chartVisible: false,
  resultComponentState: null,
  searchHeaderComponentState: null,
  diagramComponentState: null,
  searchLoadingIndicator: false,
  criteria: {},
  searchExecuted: false,
  criteriaOptionsLoaded: false,
  availableDocumentTypes: [],
  availableChannels: []
}

export const documentSearchReducer = createReducer(
  initialState,
  on(routerNavigatedAction, (state: DocumentSearchState, action: RouterNavigatedAction) => {
    const results = documentSearchCriteriasSchema.safeParse(action.payload.routerState.root.queryParams)
    if (results.success) {
      return {
        ...state,
        criteria: results.data,
        searchLoadingIndicator: Object.keys(action.payload.routerState.root.queryParams).length != 0
      }
    }
    return state
  }),
  on(DocumentSearchActions.resetButtonClicked, (state: DocumentSearchState): DocumentSearchState => ({
    ...state,
    results: initialState.results,
    criteria: {},
    searchExecuted: false
  })),
  on(
    DocumentSearchActions.searchButtonClicked,
    (state: DocumentSearchState, { searchCriteria }): DocumentSearchState => ({
      ...state,
      searchLoadingIndicator: true,
      criteria: searchCriteria
    })
  ),
  on(
    DocumentSearchActions.documentSearchResultsReceived,
    (state: DocumentSearchState, { stream }): DocumentSearchState => ({
      ...state,
      results: stream,
      searchLoadingIndicator: false,
      searchExecuted: true
    })
  ),
  on(DocumentSearchActions.documentSearchResultsLoadingFailed, (state: DocumentSearchState): DocumentSearchState => ({
    ...state,
    results: [],
    searchLoadingIndicator: false
  })),
  on(DocumentSearchActions.chartVisibilityToggled, (state: DocumentSearchState): DocumentSearchState => ({
    ...state,
    chartVisible: !state.chartVisible
  })),
  on(
    DocumentSearchActions.resultComponentStateChanged,
    (state: DocumentSearchState, resultComponentState): DocumentSearchState => ({
      ...state,
      resultComponentState
    })
  ),
  on(
    DocumentSearchActions.searchHeaderComponentStateChanged,
    (state: DocumentSearchState, searchHeaderComponentState): DocumentSearchState => ({
      ...state,
      searchHeaderComponentState
    })
  ),
  on(
    DocumentSearchActions.diagramComponentStateChanged,
    (state: DocumentSearchState, diagramComponentState): DocumentSearchState => ({
      ...state,
      diagramComponentState
    })
  ),
  on(DocumentSearchActions.availableDocTypesRecived, (state: DocumentSearchState, { types }): DocumentSearchState => ({
    ...state,
    availableDocumentTypes: types,
    criteriaOptionsLoaded: true
  })),
  on(
    DocumentSearchActions.availableChannelsRecived,
    (state: DocumentSearchState, { channels }): DocumentSearchState => ({
      ...state,
      availableChannels: channels,
      criteriaOptionsLoaded: true
    })
  )
)
