import { createFeatureSelector } from '@ngrx/store';
import { documentFeature } from './document.reducers';
import { DocumentState } from './document.state';

export const selectDocumentFeature = createFeatureSelector<DocumentState>(
  documentFeature.name
);
