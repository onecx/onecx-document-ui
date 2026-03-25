import { combineReducers, createFeature } from '@ngrx/store';
import { DocumentState } from './document.state';
import { documentSearchReducer } from './pages/document-search/document-search.reducers';
import { documentQuickUploadReducer } from './pages/document-quick-upload/document-quick-upload.reducers';

export const documentFeature = createFeature({
  name: 'document',
  reducer: combineReducers<DocumentState>({
    search: documentSearchReducer,
    quickUpload: documentQuickUploadReducer,
  }),
});
