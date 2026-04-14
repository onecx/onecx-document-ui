import { routerReducer } from '@ngrx/router-store';

const localStorageSyncMock = jest.fn();
const localStorageSyncWrapperMock = jest.fn();

jest.mock('ngrx-store-localstorage', () => ({
  localStorageSync: (config: unknown) => localStorageSyncMock(config),
}));

jest.mock('@onecx/ngrx-accelerator', () => ({
  oneCxReducer: 'ONE_CX_REDUCER',
  lazyLoadingMergeReducer: 'LAZY_LOADING_MERGE_REDUCER',
}));

import {
  localStorageSyncReducer,
  metaReducers,
  reducers,
} from './app.reducers';

describe('app.reducers', () => {
  beforeEach(() => {
    localStorageSyncMock.mockReset();
    localStorageSyncWrapperMock.mockReset();
    localStorageSyncMock.mockReturnValue(localStorageSyncWrapperMock);
  });

  it('should expose router and onecx reducers when reducers map is created', () => {
    expect((reducers as any).router).toBe(routerReducer);
    expect((reducers as any).onecx).toBe('ONE_CX_REDUCER');
  });

  it('should configure localStorageSyncReducer when wrapper is created', () => {
    const baseReducer = jest.fn();
    const wrappedReducer = jest.fn();
    localStorageSyncWrapperMock.mockReturnValue(wrappedReducer);

    const result = localStorageSyncReducer(baseReducer as any);

    expect(localStorageSyncMock).toHaveBeenCalledWith({
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
      mergeReducer: 'LAZY_LOADING_MERGE_REDUCER',
      rehydrate: true,
      storageKeySerializer: expect.any(Function),
    });
    expect(localStorageSyncWrapperMock).toHaveBeenCalledWith(baseReducer);
    expect(result).toBe(wrappedReducer);
  });

  it('should return document key prefix when storageKeySerializer is called', () => {
    const baseReducer = jest.fn();
    localStorageSyncReducer(baseReducer as any);

    const config = localStorageSyncMock.mock.calls[0][0] as {
      storageKeySerializer: (key: string) => string;
    };

    expect(config.storageKeySerializer('ignored')).toBe('document.${key}');
  });

  it('should include localStorageSyncReducer when metaReducers are defined', () => {
    expect(metaReducers).toEqual([localStorageSyncReducer]);
  });
});
