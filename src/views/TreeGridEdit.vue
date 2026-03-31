<script setup lang="ts">
import { computed, nextTick, ref, shallowRef } from 'vue'
import type {
  AutoGroupColumnDef,
  CellEditRequestEvent,
  ColDef,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  RowSelectionOptions,
  SelectionChangedEvent,
} from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { sampleTreeItems, type DemoTreeItem } from '@/data/treeItems'
import { TreeStore, type TreeStoreId } from '@/strore/TreeStore'

type TableRow = DemoTreeItem

const treeStore = new TreeStore<DemoTreeItem>(sampleTreeItems.map((item) => ({ ...item })))
const gridApi = shallowRef<GridApi<TableRow> | null>(null)
const rowData = ref<TableRow[]>([...treeStore.getAll()])
const selectedRowId = ref<TreeStoreId | null>(null)

let nextGeneratedId = 1

const selectedItem = computed<TableRow | null>(() => {
  if (selectedRowId.value === null) {
    return null
  }

  return treeStore.getItem(selectedRowId.value) ?? null
})

function isGroupItem(itemId: TreeStoreId | null | undefined): boolean {
  if (!itemId) {
    return false
  }

  return treeStore.getChildren(itemId).length > 0
}

const rowSelection: RowSelectionOptions<TableRow> = {
  mode: 'singleRow',
  checkboxes: false,
  enableClickSelection: true,
}

const defaultColDef: ColDef<TableRow> = {
  editable: false,
  resizable: false,
  sortable: false,
  suppressHeaderMenuButton: true,
}

const columnDefs: ColDef<TableRow>[] = [
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
    editable: true,
    flex: 1,
    minWidth: 240,
    cellClass: (params) =>
      isGroupItem(params.data?.id) ? 'table-cell--group' : 'table-cell--item',
  },
]

const autoGroupColumnDef: AutoGroupColumnDef<TableRow> = {
  headerName: 'Категория',
  minWidth: 240,
  flex: 1,
  cellRendererParams: {
    suppressCount: true,
  },
  valueGetter: (params) => (isGroupItem(params.data?.id) ? 'Группа' : 'Элемент'),
  cellClass: (params) => (isGroupItem(params.data?.id) ? 'table-cell--group' : 'table-cell--item'),
}

function getRowId(params: GetRowIdParams<TableRow>): string {
  return String(params.data.id)
}

function handleGridReady(event: GridReadyEvent<TableRow>): void {
  gridApi.value = event.api
}

function handleSelectionChanged(event: SelectionChangedEvent<TableRow>): void {
  selectedRowId.value = event.selectedNodes?.[0]?.data?.id ?? null
}

function handleCellEditRequest(event: CellEditRequestEvent<TableRow>): void {
  if (event.colDef.field !== 'label' || event.data === undefined) {
    return
  }

  const currentItem = treeStore.getItem(event.data.id)

  if (currentItem === undefined) {
    return
  }

  const nextLabel = typeof event.newValue === 'string' ? event.newValue.trim() : ''

  if (nextLabel.length === 0 || nextLabel === currentItem.label) {
    syncRowData({ selectedId: currentItem.id })
    return
  }

  treeStore.updateItem({
    ...currentItem,
    label: nextLabel,
  })

  syncRowData({ selectedId: currentItem.id })
}

function addRootRow(): void {
  addRow(null)
}

function addChildRow(): void {
  if (selectedRowId.value === null) {
    return
  }

  addRow(selectedRowId.value)
}

function removeSelectedRow(): void {
  if (selectedRowId.value === null) {
    return
  }

  const itemToRemove = treeStore.getItem(selectedRowId.value)
  const nextSelectedId = itemToRemove?.parent ?? null

  treeStore.removeItem(selectedRowId.value)
  syncRowData({ selectedId: nextSelectedId })
}

function addRow(parent: TreeStoreId | null): void {
  const newItem: TableRow = {
    id: createItemId(),
    parent,
    label: 'Новая строка',
  }

  treeStore.addItem(newItem)
  syncRowData({ selectedId: newItem.id, startEditing: true })
}

function createItemId(): TreeStoreId {
  let itemId = `generated-${nextGeneratedId}`

  while (treeStore.getItem(itemId) !== undefined) {
    nextGeneratedId += 1
    itemId = `generated-${nextGeneratedId}`
  }

  nextGeneratedId += 1

  return itemId
}

function syncRowData(
  options: { selectedId?: TreeStoreId | null; startEditing?: boolean } = {},
): void {
  rowData.value = [...treeStore.getAll()]

  void nextTick(() => {
    const api = gridApi.value

    if (api === null) {
      return
    }

    api.refreshClientSideRowModel('group')
    api.refreshCells({ force: true })

    if (options.selectedId === undefined) {
      return
    }

    selectedRowId.value = options.selectedId

    if (options.selectedId === null) {
      api.deselectAll()
      return
    }

    const rowNode = api.getRowNode(String(options.selectedId))

    if (rowNode === undefined || rowNode.rowIndex === null) {
      return
    }

    rowNode.setSelected(true, true)
    api.ensureIndexVisible(rowNode.rowIndex)

    if (options.startEditing === true) {
      api.startEditingCell({
        rowIndex: rowNode.rowIndex,
        colKey: 'label',
      })
    }
  })
}
</script>

<template>
  <section class="table-page">
    <div class="table-shell">
      <header class="toolbar">
        <div class="toolbar__meta">
          <p class="toolbar__mode">Режим: редактирование</p>
          <p class="toolbar__hint">Поле «Наименование» редактируется по двойному клику.</p>
          <p class="toolbar__selection">
            {{
              selectedItem === null
                ? 'Выберите строку, чтобы добавить дочерний элемент или удалить запись.'
                : `Выбрано: ${selectedItem.label}`
            }}
          </p>
        </div>
        <div class="toolbar__actions">
          <button class="toolbar__button" type="button" @click="addRootRow">
            Добавить корневую строку
          </button>

          <button
            class="toolbar__button"
            type="button"
            :disabled="selectedItem === null"
            @click="addChildRow"
          >
            Добавить дочернюю строку
          </button>

          <button
            class="toolbar__button toolbar__button--danger"
            type="button"
            :disabled="selectedItem === null"
            @click="removeSelectedRow"
          >
            Удалить выбранную строку
          </button>
        </div>
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
          :read-only-edit="true"
          :row-data="rowData"
          :row-height="56"
          :row-selection="rowSelection"
          :suppress-cell-focus="false"
          :suppress-movable-columns="true"
          :tree-data="true"
          tree-data-parent-id-field="parent"
          @cell-edit-request="handleCellEditRequest"
          @grid-ready="handleGridReady"
          @selection-changed="handleSelectionChanged"
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar__button {
  border: 1px solid #3f7ee8;
  border-radius: 4px;
  background: #ffffff;
  color: #3f7ee8;
  cursor: pointer;
  font-family: 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  padding: 12px 14px;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    opacity 0.18s ease;
}

.toolbar__button:hover:enabled {
  background: #edf4ff;
}

.toolbar__button:disabled {
  border-color: #c8c1b6;
  color: #9f988d;
  cursor: not-allowed;
}

.toolbar__button--danger {
  border-color: #d25555;
  color: #d25555;
}

.toolbar__button--danger:hover:enabled {
  background: #fff0f0;
}

.toolbar__meta {
  min-width: 320px;
  max-width: 440px;
}

.toolbar__mode,
.toolbar__hint,
.toolbar__selection {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
}

.toolbar__mode {
  color: #3f7ee8;
  font-size: 16px;
  font-weight: 600;
}

.toolbar__hint,
.toolbar__selection {
  color: #5a5651;
  font-size: 14px;
  line-height: 1.4;
}

.toolbar__hint {
  margin-top: 6px;
}

.toolbar__selection {
  margin-top: 4px;
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

@media (max-width: 840px) {
  .table-page {
    padding: 16px;
  }

  .toolbar {
    flex-direction: column;
  }

  .toolbar__meta {
    min-width: 0;
  }
}
</style>
