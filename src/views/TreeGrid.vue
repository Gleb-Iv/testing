<script setup lang="ts">
import { ref } from 'vue'
import type { AutoGroupColumnDef, ColDef, GetRowIdParams } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { sampleTreeItems, type DemoTreeItem } from '@/data/treeItems'
import { TreeStore } from '@/strore/TreeStore'

type TableRow = DemoTreeItem

const treeStore = new TreeStore<DemoTreeItem>(sampleTreeItems.map((item) => ({ ...item })))
const rowData = ref<TableRow[]>(treeStore.getAll())

const defaultColDef: ColDef<TableRow> = {
  editable: false,
  resizable: false,
  sortable: false,
  suppressHeaderMenuButton: true,
}

const columnDefs: ColDef<TableRow>[] = [
  {
    headerName: '№ п\\п',
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
    flex: 1,
    minWidth: 240,
    cellClass: (params) => (params.node?.group ? 'table-cell--group' : 'table-cell--item'),
  },
]

const autoGroupColumnDef: AutoGroupColumnDef<TableRow> = {
  headerName: 'Категория',
  minWidth: 240,
  flex: 1,
  cellRendererParams: {
    suppressCount: true,
  },
  valueGetter: (params) => (params.node?.group ? 'Группа' : 'Элемент'),
  cellClass: (params) => (params.node?.group ? 'table-cell--group' : 'table-cell--item'),
}

function getRowId(params: GetRowIdParams<TableRow>): string {
  return String(params.data.id)
}
</script>

<template>
  <section class="table-page">
    <div class="table-shell">
      <header class="toolbar">
        <p class="toolbar__mode">Режим: просмотр</p>
      </header>

      <div class="ag-theme-alpine tree-grid">
        <AgGridVue
          :auto-group-column-def="autoGroupColumnDef"
          :column-defs="columnDefs"
          :default-col-def="defaultColDef"
          dom-layout="autoHeight"
          :get-row-id="getRowId"
          :group-default-expanded="-1"
          :header-height="42"
          :row-data="rowData"
          :row-height="56"
          :suppress-cell-focus="true"
          :suppress-movable-columns="true"
          :tree-data="true"
          tree-data-parent-id-field="parent"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.table-page {
  min-height: 100vh;
  background: #f7f5f1;
  padding: 28px;
}

.table-shell {
  margin: 0 auto;
  max-width: 1120px;
}

.toolbar {
  margin-bottom: 12px;
}

.toolbar__mode {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  color: #3f7ee8;
  font-size: 16px;
  font-weight: 600;
}

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

@media (max-width: 840px) {
  .table-page {
    padding: 16px;
  }
}
</style>
