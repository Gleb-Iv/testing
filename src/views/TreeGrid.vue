<script setup lang="ts">
import { ref } from 'vue'

import TreeGridPageShell from '@/components/tree-grid/TreeGridPageShell.vue'
import TreeGridTable from '@/components/tree-grid/TreeGridTable.vue'
import {
  createTreeGridAutoGroupColumnDef,
  createTreeGridColumnDefs,
  getTreeGridRowId,
  treeGridDefaultColDef,
} from '@/components/tree-grid/treeGridConfig'
import { sampleTreeItems, type DemoTreeItem } from '@/data/treeItems'
import { TreeStore, type TreeStoreId } from '@/strore/TreeStore'

type TableRow = DemoTreeItem

const treeStore = new TreeStore<DemoTreeItem>(sampleTreeItems.map((item) => ({ ...item })))
const rowData = ref<TableRow[]>([...treeStore.getAll()])

function isGroupItem(itemId: TreeStoreId | null | undefined): boolean {
  if (itemId === null || itemId === undefined) {
    return false
  }

  return treeStore.getChildren(itemId).length > 0
}

const columnDefs = createTreeGridColumnDefs({
  isGroupItem,
})

const autoGroupColumnDef = createTreeGridAutoGroupColumnDef(isGroupItem)
</script>

<template>
  <TreeGridPageShell>
    <template #header>
      <header class="toolbar">
        <p class="toolbar__mode">Режим: просмотр</p>
      </header>
    </template>

    <TreeGridTable
      :auto-group-column-def="autoGroupColumnDef"
      :column-defs="columnDefs"
      :default-col-def="treeGridDefaultColDef"
      :get-row-id="getTreeGridRowId"
      :row-data="rowData"
    />
  </TreeGridPageShell>
</template>

<style scoped>
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
</style>
