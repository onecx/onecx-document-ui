import { ColumnType, DataTableColumn } from '@onecx/angular-accelerator'

export const documentTypeSearchColumns: DataTableColumn[] = [
  {
    id: 'name',
    nameKey: 'DOCUMENT_TYPE_SEARCH.RESULTS.NAME_COLUMN',
    columnType: ColumnType.STRING
  },
  {
    id: 'description',
    nameKey: 'DOCUMENT_TYPE_SEARCH.RESULTS.DESCRIPTION_COLUMN',
    columnType: ColumnType.STRING
  },
  {
    id: 'activeStatus',
    nameKey: 'DOCUMENT_TYPE_SEARCH.RESULTS.ACTIVE_STATUS_COLUMN',
    columnType: ColumnType.STRING
  }
]
