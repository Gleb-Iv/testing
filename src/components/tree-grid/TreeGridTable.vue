<script setup lang="ts">
import type {
  AutoGroupColumnDef,
  CellEditRequestEvent,
  ColDef,
  GetRowIdParams,
  GridReadyEvent,
  RowSelectionOptions,
  SelectionChangedEvent,
} from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'

import type { DemoTreeItem } from '@/data/treeItems'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

type TableRow = DemoTreeItem

interface Props {
  autoGroupColumnDef: AutoGroupColumnDef<TableRow>
  columnDefs: ColDef<TableRow>[]
  defaultColDef: ColDef<TableRow>
  getRowId: (params: GetRowIdParams<TableRow>) => string
  rowData: TableRow[]
  readOnlyEdit?: boolean
  rowSelection?: RowSelectionOptions<TableRow>
  suppressCellFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnlyEdit: false,
  rowSelection: undefined,
  suppressCellFocus: true,
})

const emit = defineEmits<{
  (event: 'cell-edit-request', payload: CellEditRequestEvent<TableRow>): void
  (event: 'grid-ready', payload: GridReadyEvent<TableRow>): void
  (event: 'selection-changed', payload: SelectionChangedEvent<TableRow>): void
}>()
</script>

<template>
  <div class="ag-theme-alpine tree-grid">
    <AgGridVue
      :auto-group-column-def="props.autoGroupColumnDef"
      :column-defs="props.columnDefs"
      :default-col-def="props.defaultColDef"
      dom-layout="autoHeight"
      :get-row-id="props.getRowId"
      :group-default-expanded="-1"
      :header-height="42"
      :read-only-edit="props.readOnlyEdit"
      :row-data="props.rowData"
      :row-height="56"
      :row-selection="props.rowSelection"
      :suppress-cell-focus="props.suppressCellFocus"
      :suppress-movable-columns="true"
      :tree-data="true"
      tree-data-parent-id-field="parent"
      @cell-edit-request="emit('cell-edit-request', $event)"
      @grid-ready="emit('grid-ready', $event)"
      @selection-changed="emit('selection-changed', $event)"
    />
  </div>
</template>

<style scoped>
.tree-grid {
  overflow: hidden;
  border: 1px solid #d9d4cc;
  border-radius: 4px;

  --ag-background-color: #ffffff;
  --ag-border-color: #d9d4cc;
  --ag-header-background-color: #ffffff;
  --ag-header-foreground-color: #5a5651;
  --ag-foreground-color: #4c4843;
  --ag-odd-row-background-color: #ffffff;
  --ag-row-hover-color: #faf7f2;
  --ag-selected-row-background-color: #f4efe6;
  --ag-font-family: 'Segoe UI', sans-serif;
  --ag-font-size: 14px;
  --ag-cell-horizontal-border: solid #ddd7cf;
  --ag-row-border-color: #ddd7cf;
  --ag-header-column-separator-color: #d9d4cc;
  --ag-wrapper-border-radius: 4px;
}

:deep(.ag-root-wrapper) {
  border: none;
}

:deep(.ag-header-cell),
:deep(.ag-cell) {
  padding-left: 14px;
  padding-right: 14px;
}

:deep(.ag-header-cell) {
  border-right: 1px solid #d9d4cc;
}

:deep(.ag-header-cell-label) {
  font-weight: 600;
}

:deep(.ag-cell) {
  display: flex;
  align-items: center;
}

:deep(.ag-cell-inline-editing input.ag-input-field-input),
:deep(.ag-cell-inline-editing input.ag-text-field-input) {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 14px;
  border: none;
  outline: none;
  background: transparent;
  box-shadow: none;
  color: inherit;
  font: inherit;
}

:deep(.ag-row) {
  transition: background-color 0.18s ease;
}

:deep(.ag-group-value) {
  font-weight: inherit;
}

:deep(.ag-group-expanded),
:deep(.ag-group-contracted) {
  color: #6e6861;
}

:deep(.table-index-cell) {
  font-weight: 600;
}

:deep(.table-cell--group) {
  font-weight: 700;
}

:deep(.table-cell--item) {
  font-weight: 400;
}

:deep(.table-cell--group .ag-group-value),
:deep(.table-cell--group .ag-cell-value) {
  font-weight: 700;
}

:deep(.table-cell--item .ag-group-value),
:deep(.table-cell--item .ag-cell-value) {
  font-weight: 400;
}
</style>
