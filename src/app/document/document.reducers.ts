import { combineReducers, createFeature } from '@ngrx/store';
import { DocumentState } from './document.state';

export const documentFeature = createFeature({
  name: 'document',
  reducer: combineReducers<DocumentState>({}),
});
