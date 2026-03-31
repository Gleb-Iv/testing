import { beforeEach, describe, expect, it } from 'vitest'

import { sampleTreeItems, type DemoTreeItem } from '@/data/treeItems'
import { TreeStore } from '@/strore/TreeStore'

describe('TreeStore', () => {
  let store: TreeStore<DemoTreeItem>

  beforeEach(() => {
    store = new TreeStore(sampleTreeItems)
  })

  it('возвращает все элементы, отдельный элемент и прямых детей', () => {
    expect(store.getAll()).toHaveLength(8)
    expect(store.getItem('91064cee')?.label).toBe('Айтем 2')
    expect(store.getChildren(4).map((item) => item.id)).toEqual([7, 8])
    expect(store.getChildren(8)).toEqual([])
  })

  it('возвращает всех потомков в стабильном порядке обхода по уровням', () => {
    expect(store.getAllChildren(1).map((item) => item.id)).toEqual(['91064cee', 3, 4, 5, 6, 7, 8])
  })

  it('возвращает цепочку родителей от элемента до корня с сохранением порядка', () => {
    expect(store.getAllParents(8).map((item) => item.id)).toEqual([8, 4, '91064cee', 1])
  })

  it('добавляет новые элементы без нарушения существующих индексов', () => {
    const newItem: DemoTreeItem = {
      id: 'child-9',
      parent: 5,
      label: 'Айтем 9',
    }

    store.addItem(newItem)

    expect(store.getItem('child-9')).toBe(newItem)
    expect(store.getChildren(5)).toEqual([newItem])
    expect(store.getAllChildren(1).map((item) => item.id)).toContain('child-9')
    expect(store.getAll()).toHaveLength(9)
  })

  it('обновляет данные элемента и его связь с родителем', () => {
    store.updateItem({
      id: 6,
      parent: 4,
      label: 'Айтем 6 updated',
    })

    expect(store.getItem(6)?.label).toBe('Айтем 6 updated')
    expect(store.getChildren('91064cee').map((item) => item.id)).toEqual([4, 5])
    expect(store.getChildren(4).map((item) => item.id)).toEqual([7, 8, 6])
    expect(store.getAllParents(6).map((item) => item.id)).toEqual([6, 4, '91064cee', 1])
  })

  it('удаляет элемент вместе со всем его поддеревом', () => {
    store.removeItem('91064cee')

    expect(store.getItem('91064cee')).toBeUndefined()
    expect(store.getItem(7)).toBeUndefined()
    expect(store.getChildren(1).map((item) => item.id)).toEqual([3])
    expect(store.getAll().map((item) => item.id)).toEqual([1, 3])
  })

  it('возвращает пустые коллекции для неизвестных id', () => {
    expect(store.getItem('missing')).toBeUndefined()
    expect(store.getChildren('missing')).toEqual([])
    expect(store.getAllChildren('missing')).toEqual([])
    expect(store.getAllParents('missing')).toEqual([])

    store.removeItem('missing')

    expect(store.getAll()).toHaveLength(8)
  })
})
