import { ref } from 'vue'

import { sampleTreeItems, type DemoTreeItem } from '@/data/treeItems'
import { TreeStore, type TreeStoreId } from '@/strore/TreeStore'

function createInitialItems(): DemoTreeItem[] {
  return sampleTreeItems.map((item) => ({ ...item }))
}

function createTreeStore(): TreeStore<DemoTreeItem> {
  return new TreeStore<DemoTreeItem>(createInitialItems())
}

let treeStore = createTreeStore()

const rowData = ref<DemoTreeItem[]>([...treeStore.getAll()])

function syncRowData(): void {
  rowData.value = [...treeStore.getAll()]
}

// в реальном проекте тут бы был store на Pinia
export function useTreeGridStore() {
  return {
    rowData,
    getItem(id: TreeStoreId) {
      return treeStore.getItem(id)
    },
    getChildren(id: TreeStoreId) {
      return treeStore.getChildren(id)
    },
    addItem(item: DemoTreeItem) {
      treeStore.addItem(item)
      syncRowData()
    },
    updateItem(item: DemoTreeItem) {
      treeStore.updateItem(item)
      syncRowData()
    },
    removeItem(id: TreeStoreId) {
      treeStore.removeItem(id)
      syncRowData()
    },
  }
}

export function resetTreeGridStore(): void {
  treeStore = createTreeStore()
  syncRowData()
}
