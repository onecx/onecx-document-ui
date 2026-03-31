import { ColumnType } from '@onecx/angular-accelerator';
import * as selectors from './document-search.selectors';

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
      columns,
      searchCriteria,
      results,
      null,
      null,
      null,
      chartVisible,
      false,
      true,
      true,
      availableDocumentTypes,
      availableChannels
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
});
