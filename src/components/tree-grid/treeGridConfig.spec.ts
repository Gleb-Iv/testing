import { describe, expect, it } from 'vitest'

import {
  createTreeGridAutoGroupColumnDef,
  createTreeGridColumnDefs,
  getTreeGridRowId,
  treeGridDefaultColDef,
} from '@/components/tree-grid/treeGridConfig'

describe('treeGridConfig', () => {
  const isGroupItem = (itemId: string | number | null | undefined) => itemId === 1

  it('creates shared column defs with editable label mode when requested', () => {
    const [indexColumn, labelColumn] = createTreeGridColumnDefs({
      editableLabel: true,
      isGroupItem,
    })
    const indexValueGetter = indexColumn?.valueGetter
    const labelCellClass = labelColumn?.cellClass

    expect(indexColumn?.headerName).toBe('№ п/п')
    expect(labelColumn?.headerName).toBe('Наименование')
    expect(labelColumn?.editable).toBe(true)
    expect(typeof indexValueGetter).toBe('function')
    expect(typeof labelCellClass).toBe('function')

    if (typeof indexValueGetter !== 'function' || typeof labelCellClass !== 'function') {
      throw new Error('Expected ag-grid callbacks to be functions.')
    }

    expect(indexValueGetter({ node: { rowIndex: 2 } } as never)).toBe(3)
    expect(labelCellClass({ data: { id: 1 } } as never)).toBe('table-cell--group')
    expect(labelCellClass({ data: { id: 2 } } as never)).toBe('table-cell--item')
  })

  it('creates shared auto group config and stable row ids', () => {
    const autoGroupColumnDef = createTreeGridAutoGroupColumnDef(isGroupItem)
    const autoGroupValueGetter = autoGroupColumnDef.valueGetter

    expect(autoGroupColumnDef.headerName).toBe('Категория')
    expect(autoGroupColumnDef.cellRendererParams).toEqual({ suppressCount: true })
    expect(getTreeGridRowId({ data: { id: 42 } } as never)).toBe('42')
    expect(typeof autoGroupValueGetter).toBe('function')

    if (typeof autoGroupValueGetter !== 'function') {
      throw new Error('Expected ag-grid value getter to be a function.')
    }

    expect(autoGroupValueGetter({ data: { id: 1 } } as never)).toBe('Группа')
    expect(autoGroupValueGetter({ data: { id: 2 } } as never)).toBe('Элемент')
  })

  it('exposes shared default col settings', () => {
    expect(treeGridDefaultColDef).toMatchObject({
      editable: false,
      resizable: false,
      sortable: false,
      suppressHeaderMenuButton: true,
    })
  })
})
