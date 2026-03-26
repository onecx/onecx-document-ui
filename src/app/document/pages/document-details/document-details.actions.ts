import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DocumentDetail } from '../../../shared/generated';

export const DocumentDetailsActions = createActionGroup({
  source: 'DocumentDetails',
  events: {
    'navigated to details page': props<{
      id: string | undefined;
    }>(),
    'document details received': props<{
      details: DocumentDetail;
    }>(),
    'document details loading failed': props<{ error: string | null }>(),
    'edit mode set': props<{ editMode: boolean }>(),
    'Update document cancelled': emptyProps(),
    'Update document succeeded': emptyProps(),
    'Update document failed': props<{
      error: string | null;
    }>(),
    'Delete document cancelled': emptyProps(),
    'Delete document succeeded': emptyProps(),
    'Delete document failed': props<{
      error: string | null;
    }>(),
    'cancel edit back clicked': emptyProps(),
    'cancel edit confirm clicked': emptyProps(),
    'cancel edit not dirty': emptyProps(),
    'edit button clicked': emptyProps(),
    'save button clicked': props<{
      details: DocumentDetail;
    }>(),
    'cancel button clicked': props<{
      dirty: boolean;
    }>(),
    'delete button clicked': emptyProps(),
    'navigate back button clicked': emptyProps(),
    'back navigation started': emptyProps(),
    'back navigation failed': emptyProps(),
    'navigation to search started': emptyProps(),
    'navigation to search not started': emptyProps(),
  },
});
