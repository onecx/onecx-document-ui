import { routerReducer } from '@ngrx/router-store';
import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { lazyLoadingMergeReducer, oneCxReducer } from '@onecx/ngrx-accelerator';
import { localStorageSync } from 'ngrx-store-localstorage';
import { State } from './app.state';

export const reducers: ActionReducerMap<State> = {
  router: routerReducer,
  onecx: oneCxReducer,
};

export function localStorageSyncReducer(
  reducer: ActionReducer<any> // eslint-disable-line @typescript-eslint/no-explicit-any
): ActionReducer<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  return localStorageSync({
    keys: [
      {
        document: [
          {
            search: [
              'chartVisible',
              'resultComponentState',
              'searchHeaderComponentState',
              'diagramComponentState',
            ],
          },
        ],
      },
    ],
    mergeReducer: lazyLoadingMergeReducer,
    rehydrate: true,
    storageKeySerializer: (key) => 'document.${key}', // eslint-disable-line @typescript-eslint/no-unused-vars
  })(reducer);
}

export const metaReducers: MetaReducer<State>[] = [localStorageSyncReducer];
