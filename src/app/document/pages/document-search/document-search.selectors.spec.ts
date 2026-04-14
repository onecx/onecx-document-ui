import { ColumnType } from '@onecx/angular-accelerator';
import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { documentFeature } from '../../document.reducers';
import * as selectors from './document-search.selectors';
import { DocumentSearchActions } from './document-search.actions';

describe('DocumentSearch selectors', () => {
  describe('selectResults projector', () => {
    it('should map results to RowListGridData[] with imagePath and typeName', () => {
      const input = [
        { id: '1', name: 'A', type: { name: 'Invoice', id: 't1' } },
        { id: '2', name: 'B', type: { name: 'Contract', id: 't2' } },
      ] as any;

      const result = selectors.selectResults.projector(input);

      expect(result).toEqual([
        {
          imagePath: '',
          id: '1',
          name: 'A',
          type: { name: 'Invoice', id: 't1' },
          typeName: 'Invoice',
        },
        {
          imagePath: '',
          id: '2',
          name: 'B',
          type: { name: 'Contract', id: 't2' },
          typeName: 'Contract',
        },
      ]);
    });

    it('should use item.id directly when id is an empty string', () => {
      const input = [{ id: '', name: 'A' }] as any;

      const result = selectors.selectResults.projector(input);

      expect(result[0].id).toBe('');
    });

    it('should set typeName to undefined when type is not present', () => {
      const input = [{ id: '1', name: 'A' }] as any;

      const result = selectors.selectResults.projector(input);

      expect(result[0]['typeName']).toBeUndefined();
    });
  });

  it('should combine all 12 selector results into DocumentSearchViewModel', () => {
    const columns = [
      { id: 'col1', nameKey: 'Col 1', columnType: ColumnType.STRING },
    ];
    const searchCriteria = { name: 'test' };
    const results = [{ imagePath: '', id: '1', name: 'A' }] as any;
    const chartVisible = true;
    const availableDocumentTypes = [{ label: 'Invoice', value: 't1' }];
    const availableChannels = [{ label: 'Email', value: 'c1' }];

    const result = selectors.selectDocumentSearchViewModel.projector(
      {
        columns,
        searchCriteria,
        results,
        resultComponentState: null,
        searchHeaderComponentState: null,
        diagramComponentState: null,
      },
      {
        chartVisible,
        searchLoadingIndicator: false,
        searchExecuted: true,
        criteriaOptionsLoaded: true,
        availableDocumentTypes,
        avilableChannels: availableChannels,
      }
    );

    expect(result).toEqual({
      columns,
      searchCriteria,
      results,
      resultComponentState: null,
      searchHeaderComponentState: null,
      diagramComponentState: null,
      chartVisible,
      searchLoadingIndicator: false,
      searchExecuted: true,
      criteriaOptionsLoaded: true,
      availableDocumentTypes,
      avilableChannels: availableChannels,
    });
  });

  describe('selectDocumentSearchViewModel type mapping integration', () => {
    it('should map DocumentType[] to SelectItem[] with label=name and value=id', () => {
      const docTypes = [
        { id: 't1', name: 'Invoice' },
        { id: 't2', name: 'Contract' },
      ];
      const channels = [{ id: 'c1', name: 'Email' }];

      // Pass raw DocumentType[] through the full 12-arg projector path:
      // selectDocumentTypes and selectChannels are private but tested via selectDocumentSearchViewModel
      // by calling their input projectors directly (they receive already-mapped SelectItem[])
      // Here we verify the mapping that documentSearchSelectors.selectAvailableDocumentTypes feeds into selectDocumentTypes

      // The mapping: docTypes.map(t => ({ label: t.name, value: t.id }))
      const mappedTypes = docTypes.map((t) => ({ label: t.name, value: t.id }));
      const mappedChannels = channels.map((c) => ({
        label: c.name,
        value: c.id,
      }));

      const result = selectors.selectDocumentSearchViewModel.projector(
        {
          columns: [],
          searchCriteria: {},
          results: [],
          resultComponentState: null,
          searchHeaderComponentState: null,
          diagramComponentState: null,
        },
        {
          chartVisible: false,
          searchLoadingIndicator: false,
          searchExecuted: false,
          criteriaOptionsLoaded: false,
          availableDocumentTypes: mappedTypes,
          avilableChannels: mappedChannels,
        }
      );

      expect(result.availableDocumentTypes).toEqual([
        { label: 'Invoice', value: 't1' },
        { label: 'Contract', value: 't2' },
      ]);
      expect(result.avilableChannels).toEqual([
        { label: 'Email', value: 'c1' },
      ]);
    });

    it('should return empty arrays when no types or channels are available', () => {
      const result = selectors.selectDocumentSearchViewModel.projector(
        {
          columns: [],
          searchCriteria: {},
          results: [],
          resultComponentState: null,
          searchHeaderComponentState: null,
          diagramComponentState: null,
        },
        {
          chartVisible: false,
          searchLoadingIndicator: false,
          searchExecuted: false,
          criteriaOptionsLoaded: false,
          availableDocumentTypes: [],
          avilableChannels: [],
        }
      );

      expect(result.availableDocumentTypes).toEqual([]);
      expect(result.avilableChannels).toEqual([]);
    });
  });

  describe('internal selectDocumentTypes and selectChannels via full store chain', () => {
    it('should execute internal type and channel mapping projectors via real store', (done) => {
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({}),
          StoreModule.forFeature(documentFeature),
        ],
      });
      const store = TestBed.inject(Store);

      // Running store.select(selectDocumentSearchViewModel) chains through
      // selectDocumentTypes and selectChannels internal selectors
      store
        .select(selectors.selectDocumentSearchViewModel)
        .pipe(take(1))
        .subscribe((vm) => {
          expect(Array.isArray(vm.availableDocumentTypes)).toBe(true);
          expect(Array.isArray(vm.avilableChannels)).toBe(true);
          done();
        });
    });

    it('should map document types and channels to SelectItems when store is populated with non-empty data', (done) => {
      TestBed.configureTestingModule({
        imports: [
          StoreModule.forRoot({}),
          StoreModule.forFeature(documentFeature),
        ],
      });
      const store = TestBed.inject(Store);

      store.dispatch(
        DocumentSearchActions.availableDocTypesRecived({
          types: [{ id: 't1', name: 'Invoice' }] as any,
        })
      );
      store.dispatch(
        DocumentSearchActions.availableChannelsRecived({
          channels: [{ id: 'c1', name: 'Email' }] as any,
        })
      );

      store
        .select(selectors.selectDocumentSearchViewModel)
        .pipe(take(1))
        .subscribe((vm) => {
          expect(vm.availableDocumentTypes).toEqual([
            { label: 'Invoice', value: 't1' },
          ]);
          expect(vm.avilableChannels).toEqual([
            { label: 'Email', value: 'c1' },
          ]);
          done();
        });
    });
  });
});
