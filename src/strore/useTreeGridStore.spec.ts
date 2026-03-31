import { beforeEach, describe, expect, it } from 'vitest'

import { resetTreeGridStore, useTreeGridStore } from '@/strore/useTreeGridStore'

describe('useTreeGridStore', () => {
  beforeEach(() => {
    resetTreeGridStore()
  })

  it('shares the same tree data across different consumers', () => {
    const viewStore = useTreeGridStore()
    const editStore = useTreeGridStore()

    editStore.updateItem({
      id: 3,
      parent: 1,
      label: 'Айтем 3 updated',
    })

    editStore.addItem({
      id: 'generated-1',
      parent: null,
      label: 'Новая строка',
    })

    expect(viewStore.getItem(3)?.label).toBe('Айтем 3 updated')
    expect(viewStore.rowData.value.find((item) => item.id === 3)?.label).toBe('Айтем 3 updated')
    expect(viewStore.rowData.value.map((item) => item.id)).toContain('generated-1')
    expect(viewStore.rowData.value).toHaveLength(9)
  })
})
