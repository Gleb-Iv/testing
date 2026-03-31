import { defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { mount } from '@vue/test-utils'

import type { ColDef, RowSelectionOptions } from 'ag-grid-community'

import type { DemoTreeItem } from '@/data/treeItems'
import TreeGridTable from '@/components/tree-grid/TreeGridTable.vue'

vi.mock('ag-grid-vue3', () => ({
  AgGridVue: defineComponent({
    name: 'AgGridVue',
    props: [
      'autoGroupColumnDef',
      'columnDefs',
      'defaultColDef',
      'domLayout',
      'getRowId',
      'groupDefaultExpanded',
      'headerHeight',
      'readOnlyEdit',
      'rowData',
      'rowHeight',
      'rowSelection',
      'suppressCellFocus',
      'suppressMovableColumns',
      'treeData',
      'treeDataParentIdField',
    ],
    emits: ['cell-edit-request', 'grid-ready', 'selection-changed'],
    template: '<div data-testid="ag-grid-stub"></div>',
  }),
}))

type TableRow = DemoTreeItem

const rowData: TableRow[] = [{ id: 1, parent: null, label: 'Item 1' }]

const columnDefs: ColDef<TableRow>[] = [{ field: 'label', headerName: 'Name' }]

const autoGroupColumnDef = {
  headerName: 'Category',
}

const defaultColDef: ColDef<TableRow> = {
  sortable: false,
}

const getRowId = ({ data }: { data: TableRow }) => String(data.id)

describe('TreeGridTable', () => {
  it('passes shared grid configuration and provided props into AgGridVue', () => {
    const rowSelection: RowSelectionOptions<TableRow> = {
      mode: 'singleRow',
      checkboxes: false,
      enableClickSelection: true,
    }

    const wrapper = mount(TreeGridTable, {
      props: {
        autoGroupColumnDef,
        columnDefs,
        defaultColDef,
        getRowId,
        readOnlyEdit: true,
        rowData,
        rowSelection,
        suppressCellFocus: false,
      },
    })

    const grid = wrapper.getComponent({ name: 'AgGridVue' })

    expect(grid.props('autoGroupColumnDef')).toEqual(autoGroupColumnDef)
    expect(grid.props('columnDefs')).toEqual(columnDefs)
    expect(grid.props('defaultColDef')).toEqual(defaultColDef)
    expect(grid.props('getRowId')).toBe(getRowId)
    expect(grid.props('rowData')).toEqual(rowData)
    expect(grid.props('rowSelection')).toEqual(rowSelection)
    expect(grid.props('readOnlyEdit')).toBe(true)
    expect(grid.props('suppressCellFocus')).toBe(false)
    expect(grid.props('domLayout')).toBe('autoHeight')
    expect(grid.props('groupDefaultExpanded')).toBe(-1)
    expect(grid.props('headerHeight')).toBe(42)
    expect(grid.props('rowHeight')).toBe(56)
    expect(grid.props('suppressMovableColumns')).toBe(true)
    expect(grid.props('treeData')).toBe(true)
    expect(grid.props('treeDataParentIdField')).toBe('parent')
  })

  it('re-emits grid events to the parent component', async () => {
    const wrapper = mount(TreeGridTable, {
      props: {
        autoGroupColumnDef,
        columnDefs,
        defaultColDef,
        getRowId,
        rowData,
      },
    })

    const grid = wrapper.getComponent({ name: 'AgGridVue' })
    const gridReadyEvent = { api: { id: 'grid-api' } }
    const selectionChangedEvent = { selectedNodes: [{ data: rowData[0] }] }
    const cellEditRequestEvent = { data: rowData[0], newValue: 'Updated' }

    grid.vm.$emit('grid-ready', gridReadyEvent)
    grid.vm.$emit('selection-changed', selectionChangedEvent)
    grid.vm.$emit('cell-edit-request', cellEditRequestEvent)

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('grid-ready')).toEqual([[gridReadyEvent]])
    expect(wrapper.emitted('selection-changed')).toEqual([[selectionChangedEvent]])
    expect(wrapper.emitted('cell-edit-request')).toEqual([[cellEditRequestEvent]])
  })

  it('uses shared defaults for optional editing props', () => {
    const wrapper = mount(TreeGridTable, {
      props: {
        autoGroupColumnDef,
        columnDefs,
        defaultColDef,
        getRowId,
        rowData,
      },
    })

    const grid = wrapper.getComponent({ name: 'AgGridVue' })

    expect(grid.props('readOnlyEdit')).toBe(false)
    expect(grid.props('rowSelection')).toBeUndefined()
    expect(grid.props('suppressCellFocus')).toBe(true)
  })
})
