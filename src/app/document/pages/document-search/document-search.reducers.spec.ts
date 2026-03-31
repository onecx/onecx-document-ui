import {
  DiagramType,
  GroupByCountDiagramComponentState,
  InteractiveDataViewComponentState,
  SearchHeaderComponentState,
} from '@onecx/angular-accelerator';
import { DocumentSearchActions } from './document-search.actions';
import * as reducers from './document-search.reducers';

describe('DocumentSearchReducer', () => {
  it('should reset results and criteria on resetButtonClicked', () => {
    const preState = {
      ...reducers.initialState,
      results: [{ id: '1' }],
      criteria: { name: 'old-value' },
    };
    const action = DocumentSearchActions.resetButtonClicked();
    const state = reducers.documentSearchReducer(preState, action);
    expect(state.results).toEqual([]);
    expect(state.criteria).toEqual({});
  });

  it('should set searchLoadingIndicator and criteria on searchButtonClicked', () => {
    const searchCriteria = { name: 'foo' };
    const action = DocumentSearchActions.searchButtonClicked({
      searchCriteria,
    });
    const state = reducers.documentSearchReducer(reducers.initialState, action);
    expect(state.searchLoadingIndicator).toBe(true);
    expect(state.criteria).toEqual(searchCriteria);
  });

  it('should set results on documentSearchResultsReceived', () => {
    const stream = [{ id: '1' }, { id: '2' }];
    const action = DocumentSearchActions.documentSearchResultsReceived({
      stream,
      size: 2,
      number: 0,
      totalElements: 2,
      totalPages: 1,
    });
    const state = reducers.documentSearchReducer(reducers.initialState, action);
    expect(state.results).toEqual(stream);
  });

  it('should clear results on documentSearchResultsLoadingFailed', () => {
    const preState = { ...reducers.initialState, results: [{ id: '1' }] };
    const action = DocumentSearchActions.documentSearchResultsLoadingFailed({
      error: null,
    });
    const state = reducers.documentSearchReducer(preState, action);
    expect(state.results).toEqual([]);
  });

  it('should toggle chartVisible on chartVisibilityToggled', () => {
    const initialStateWithChartHidden = {
      ...reducers.initialState,
      chartVisible: false,
    };
    const action = DocumentSearchActions.chartVisibilityToggled();
    let state = reducers.documentSearchReducer(
      initialStateWithChartHidden,
      action
    );
    expect(state.chartVisible).toBe(true);

    const stateWithChartVisible = {
      ...reducers.initialState,
      chartVisible: true,
    };
    state = reducers.documentSearchReducer(stateWithChartVisible, action);
    expect(state.chartVisible).toBe(false);
  });

  it('should update resultComponentState when resultComponentStateChanged', () => {
    const newComponentState: InteractiveDataViewComponentState = {};
    const action =
      DocumentSearchActions.resultComponentStateChanged(newComponentState);
    const state = reducers.documentSearchReducer(reducers.initialState, action);
    expect(state.resultComponentState).toBeDefined();
    expect(state).not.toBe(reducers.initialState);
  });

  it('should update searchHeaderComponentState when searchHeaderComponentStateChanged', () => {
    const newHeaderState: SearchHeaderComponentState = {
      activeViewMode: 'basic',
      selectedSearchConfig: 'config1',
    };
    const action =
      DocumentSearchActions.searchHeaderComponentStateChanged(newHeaderState);
    const state = reducers.documentSearchReducer(reducers.initialState, action);
    expect(state.searchHeaderComponentState).toBeDefined();
    if (state.searchHeaderComponentState) {
      expect(state.searchHeaderComponentState.activeViewMode).toBe('basic');
      expect(state.searchHeaderComponentState.selectedSearchConfig).toBe(
        'config1'
      );
    }
    expect(state).not.toBe(reducers.initialState);
  });

  it('should update diagramComponentState when diagramComponentStateChanged', () => {
    const newDiagramState: GroupByCountDiagramComponentState = {
      activeDiagramType: DiagramType.PIE,
    };
    const action =
      DocumentSearchActions.diagramComponentStateChanged(newDiagramState);
    const state = reducers.documentSearchReducer(reducers.initialState, action);
    expect(state.diagramComponentState).toBeDefined();
    if (state.diagramComponentState) {
      expect(state.diagramComponentState.activeDiagramType).toBe('PIE');
    }
    expect(state).not.toBe(reducers.initialState);
  });

  it('should set criteria and searchLoadingIndicator=true when routerNavigatedAction succeeds and queryParams present', () => {
    const { routerNavigatedAction } = require('@ngrx/router-store');
    const mockSchema = require('./document-search.parameters');
    jest
      .spyOn(mockSchema.documentSearchCriteriasSchema, 'safeParse')
      .mockReturnValue({
        success: true,
        data: { foo: 'bar' },
      });
    const preState = {
      ...reducers.initialState,
      criteria: {},
      searchLoadingIndicator: false,
    };
    const action = routerNavigatedAction({
      payload: { routerState: { root: { queryParams: { foo: 'bar' } } } },
    });
    const state = reducers.documentSearchReducer(preState, action);
    expect(state.criteria).toEqual({ foo: 'bar' });
    expect(state.searchLoadingIndicator).toBe(true);
  });

  it('should not change state when routerNavigatedAction fails schema parse', () => {
    const { routerNavigatedAction } = require('@ngrx/router-store');
    const mockSchema = require('./document-search.parameters');
    jest
      .spyOn(mockSchema.documentSearchCriteriasSchema, 'safeParse')
      .mockReturnValue({
        success: false,
      });
    const preState = {
      ...reducers.initialState,
      criteria: { name: 'bar' },
      searchLoadingIndicator: true,
    };
    const action = routerNavigatedAction({
      payload: { routerState: { root: { queryParams: { foo: 'bar' } } } },
    });
    const state = reducers.documentSearchReducer(preState, action);
    expect(state).toBe(preState);
  });
});
