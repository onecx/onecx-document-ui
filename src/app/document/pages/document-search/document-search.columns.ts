import { ColumnType, DataTableColumn } from '@onecx/angular-accelerator'

export const documentSearchColumns: DataTableColumn[] = [
  {
    id: 'name',
    nameKey: 'DOCUMENT_SEARCH.RESULTS.NAME_COLUMN',
    columnType: ColumnType.STRING
  },
  {
    id: 'typeName',
    nameKey: 'DOCUMENT_SEARCH.RESULTS.TYPE_NAME_COLUMN',
    columnType: ColumnType.STRING
  },
  {
    id: 'lifeCycleState',
    nameKey: 'DOCUMENT_SEARCH.RESULTS.STATE_COLUMN',
    columnType: ColumnType.STRING
  },
  {
    id: 'documentVersion',
    nameKey: 'DOCUMENT_SEARCH.RESULTS.VERSION_COLUMN',
    columnType: ColumnType.STRING
  },
  {
    id: 'creationUser',
    nameKey: 'DOCUMENT_SEARCH.RESULTS.USER_COLUMN',
    columnType: ColumnType.STRING
  },
  {
    id: 'creationDate',
    nameKey: 'DOCUMENT_SEARCH.RESULTS.CREATION_COLUMN',
    columnType: ColumnType.DATE
  },
  {
    id: 'modificationDate',
    nameKey: 'DOCUMENT_SEARCH.RESULTS.MODIFICATION_COLUMN',
    columnType: ColumnType.DATE
  }
]
