import { routerReducer } from '@ngrx/router-store'
import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store'
import { localStorageSync } from 'ngrx-store-localstorage'

import { lazyLoadingMergeReducer, oneCxReducer } from '@onecx/ngrx-accelerator'

import { State } from './app.state'

export const reducers: ActionReducerMap<State> = {
  router: routerReducer,
  onecx: oneCxReducer
}

export function localStorageSyncReducer<StateType>(reducer: ActionReducer<StateType>): ActionReducer<StateType> {
  return localStorageSync({
    keys: [
      {
        document: [
          {
            search: ['chartVisible', 'resultComponentState', 'searchHeaderComponentState', 'diagramComponentState']
          }
        ]
      }
    ],
    mergeReducer: lazyLoadingMergeReducer,
    rehydrate: true,
    storageKeySerializer: (key) => `document.${key}`
  })(reducer)
}

export const metaReducers: MetaReducer<State>[] = [localStorageSyncReducer]
