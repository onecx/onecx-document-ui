import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  GroupByCountDiagramComponentState,
  InteractiveDataViewComponentState,
  SearchHeaderComponentState,
} from '@onecx/portal-integration-angular';
import {
  Channel,
  DocumentDetail,
  DocumentType,
} from '../../../shared/generated';
import { DocumentSearchCriteriaSchema } from './document-search.parameters';

export const DocumentSearchActions = createActionGroup({
  source: 'DocumentSearch',
  events: {
    'Details button clicked': props<{
      id: number | string;
    }>(),

    'Search button clicked': props<{
      searchCriteria: DocumentSearchCriteriaSchema;
    }>(),
    'Reset button clicked': emptyProps(),
    'perform search': props<{
      searchCriteria: DocumentSearchCriteriaSchema;
    }>(),
    'document search results received': props<{
      stream: DocumentDetail[];
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    }>(),
    'load available criteria options and search': props<{
      criteria: DocumentSearchCriteriaSchema;
    }>(),
    'available channels recived': props<{ channels: Channel[] }>(),
    'available doc types recived': props<{ types: DocumentType[] }>(),
    'document search results loading failed': props<{ error: string | null }>(),
    'Export button clicked': emptyProps(),
    'Result component state changed':
      props<InteractiveDataViewComponentState>(),
    'Search header component state changed':
      props<SearchHeaderComponentState>(),
    'Diagram component state changed':
      props<GroupByCountDiagramComponentState>(),
    'Chart visibility toggled': emptyProps(),
  },
});
