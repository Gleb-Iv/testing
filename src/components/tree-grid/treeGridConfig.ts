import type { AutoGroupColumnDef, ColDef, GetRowIdParams } from 'ag-grid-community'

import type { DemoTreeItem } from '@/data/treeItems'
import type { TreeStoreId } from '@/strore/TreeStore'

export type TreeGridRow = DemoTreeItem

type GroupItemResolver = (itemId: TreeStoreId | null | undefined) => boolean

export const treeGridDefaultColDef: ColDef<TreeGridRow> = {
  editable: false,
  resizable: false,
  sortable: false,
  suppressHeaderMenuButton: true,
}

export function createTreeGridColumnDefs(options: {
  editableLabel?: boolean
  isGroupItem: GroupItemResolver
}): ColDef<TreeGridRow>[] {
  return [
    {
      headerName: '№ п/п',
      colId: 'index',
      width: 72,
      minWidth: 72,
      maxWidth: 72,
      pinned: 'left',
      lockPinned: true,
      valueGetter: (params) => {
        const rowIndex = params.node?.rowIndex

        return rowIndex === null || rowIndex === undefined ? '' : rowIndex + 1
      },
      cellClass: 'table-index-cell',
    },
    {
      headerName: 'Наименование',
      field: 'label',
      editable: options.editableLabel ?? false,
      flex: 1,
      minWidth: 240,
      cellClass: (params) =>
        options.isGroupItem(params.data?.id) ? 'table-cell--group' : 'table-cell--item',
    },
  ]
}

export function createTreeGridAutoGroupColumnDef(
  isGroupItem: GroupItemResolver,
): AutoGroupColumnDef<TreeGridRow> {
  return {
    headerName: 'Категория',
    minWidth: 240,
    flex: 1,
    cellRendererParams: {
      suppressCount: true,
    },
    valueGetter: (params) => (isGroupItem(params.data?.id) ? 'Группа' : 'Элемент'),
    cellClass: (params) => (isGroupItem(params.data?.id) ? 'table-cell--group' : 'table-cell--item'),
  }
}

export function getTreeGridRowId(params: GetRowIdParams<TreeGridRow>): string {
  return String(params.data.id)
}
