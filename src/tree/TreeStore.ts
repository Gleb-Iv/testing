export type TreeStoreId = string | number

export interface TreeStoreItem {
  id: TreeStoreId
  parent: TreeStoreId | null
  label: string
  [key: string]: unknown
}

type TreeParentId = TreeStoreId | null
type OrderSlot = TreeStoreId | typeof DELETED

// Маркер удаленного слота в массиве.
const DELETED = Symbol('deleted')

export class TreeStore<T extends TreeStoreItem> {
  private readonly itemsById = new Map<TreeStoreId, T>()
  private readonly childIdsByParent = new Map<TreeParentId, Set<TreeStoreId>>()
  private readonly order: OrderSlot[] = []
  private readonly orderIndexById = new Map<TreeStoreId, number>()

  private allItemsCache: T[] | null = null
  private allItemsCacheIndexById: Map<TreeStoreId, number> | null = null

  get allItems() {
    return this.allItemsCache || []
  }

  public constructor(items: readonly T[]) {
    for (const item of items) {
      this.insertItem(item, false)
    }

    this.buildAllItemsCache()
  }

  /** Возвращает все элементы в порядке добавления. */
  public getAll(): T[] {
    if (this.allItemsCache === null) {
      this.buildAllItemsCache()
    }

    return this.allItemsCache ?? []
  }

  /** Возвращает элемент по его id. */
  public getItem(id: TreeStoreId): T | undefined {
    return this.itemsById.get(id)
  }

  /** Возвращает прямых дочерних элементов указанного узла. */
  public getChildren(id: TreeStoreId): T[] {
    const childIds = this.childIdsByParent.get(id)

    if (childIds === undefined || childIds.size === 0) {
      return []
    }

    const children: T[] = []

    for (const childId of childIds) {
      const child = this.itemsById.get(childId)

      if (child !== undefined) {
        children.push(child)
      }
    }

    return children
  }

  /** Возвращает всех потомков указанного узла. */
  public getAllChildren(id: TreeStoreId): T[] {
    const directChildren = this.childIdsByParent.get(id)

    if (directChildren === undefined || directChildren.size === 0) {
      return []
    }

    const queue = Array.from(directChildren)
    const descendants: T[] = []

    for (let index = 0; index < queue.length; index += 1) {
      const currentId = queue[index]

      if (currentId === undefined) {
        continue
      }

      const currentItem = this.itemsById.get(currentId)

      if (currentItem === undefined) {
        continue
      }

      descendants.push(currentItem)

      const childIds = this.childIdsByParent.get(currentId)

      if (childIds === undefined || childIds.size === 0) {
        continue
      }

      for (const childId of childIds) {
        queue.push(childId)
      }
    }

    return descendants
  }

  /** Возвращает цепочку от самого элемента до корня. */
  public getAllParents(id: TreeStoreId): T[] {
    const parents: T[] = []
    let currentItem = this.itemsById.get(id)

    while (currentItem !== undefined) {
      parents.push(currentItem)

      if (currentItem.parent === null) {
        break
      }

      currentItem = this.itemsById.get(currentItem.parent)
    }

    return parents
  }

  /** Добавляет новый элемент и обновляет все индексы. */
  public addItem(item: T): void {
    this.insertItem(item, true)
  }

  /** Удаляет элемент вместе со всем его поддеревом. */
  public removeItem(id: TreeStoreId): void {
    if (!this.itemsById.has(id)) {
      return
    }

    const idsToRemove = this.collectSubtreeIds(id)

    for (const itemId of idsToRemove) {
      const item = this.itemsById.get(itemId)

      if (item === undefined) {
        continue
      }

      this.unlinkChild(item.parent, itemId)
      this.childIdsByParent.delete(itemId)
      this.itemsById.delete(itemId)

      const orderIndex = this.orderIndexById.get(itemId)

      if (orderIndex !== undefined) {
        this.order[orderIndex] = DELETED
        this.orderIndexById.delete(itemId)
      }
    }

    this.invalidateAllItemsCache()

    if (this.shouldCompactOrder()) {
      this.compactOrder()
    }
  }

  /** Обновляет существующий элемент и при необходимости переносит его к новому родителю. */
  public updateItem(item: T): void {
    const previousItem = this.itemsById.get(item.id)

    if (previousItem === undefined) {
      throw new Error(`Item with id "${String(item.id)}" does not exist.`)
    }

    this.itemsById.set(item.id, item)

    if (previousItem.parent !== item.parent) {
      this.unlinkChild(previousItem.parent, item.id)
      this.linkChild(item.parent, item.id)
    }

    if (this.allItemsCache !== null && this.allItemsCacheIndexById !== null) {
      const cacheIndex = this.allItemsCacheIndexById.get(item.id)

      if (cacheIndex !== undefined) {
        this.allItemsCache[cacheIndex] = item
      }
    }
  }

  /** Добавляет элемент в индексы и в массив порядка. */
  private insertItem(item: T, updateCache: boolean): void {
    if (this.itemsById.has(item.id)) {
      throw new Error(`Item with id "${String(item.id)}" already exists.`)
    }

    this.itemsById.set(item.id, item)
    this.orderIndexById.set(item.id, this.order.length)
    this.order.push(item.id)
    this.linkChild(item.parent, item.id)

    if (!updateCache || this.allItemsCache === null || this.allItemsCacheIndexById === null) {
      return
    }

    this.allItemsCacheIndexById.set(item.id, this.allItemsCache.length)
    this.allItemsCache.push(item)
  }

  /** Привязывает дочерний id к родительскому id. */
  private linkChild(parentId: TreeParentId, childId: TreeStoreId): void {
    const existingChildren = this.childIdsByParent.get(parentId)

    if (existingChildren !== undefined) {
      existingChildren.add(childId)
      return
    }

    this.childIdsByParent.set(parentId, new Set([childId]))
  }

  /** Удаляет связь между дочерним и родительским id. */
  private unlinkChild(parentId: TreeParentId, childId: TreeStoreId): void {
    const existingChildren = this.childIdsByParent.get(parentId)

    if (existingChildren === undefined) {
      return
    }

    existingChildren.delete(childId)

    if (existingChildren.size === 0) {
      this.childIdsByParent.delete(parentId)
    }
  }

  /** Собирает id всего поддерева, начиная с указанного корня. */
  private collectSubtreeIds(rootId: TreeStoreId): TreeStoreId[] {
    const ids = [rootId]

    for (let index = 0; index < ids.length; index += 1) {
      const currentId = ids[index]

      if (currentId === undefined) {
        continue
      }

      const childIds = this.childIdsByParent.get(currentId)

      if (childIds === undefined || childIds.size === 0) {
        continue
      }

      for (const childId of childIds) {
        ids.push(childId)
      }
    }

    return ids
  }

  /** Пересобирает кэш массива, который возвращает getAll(). */
  private buildAllItemsCache(): void {
    const items: T[] = []
    const indexById = new Map<TreeStoreId, number>()

    for (const slot of this.order) {
      if (slot === DELETED) {
        continue
      }

      const item = this.itemsById.get(slot)

      if (item === undefined) {
        continue
      }

      indexById.set(slot, items.length)
      items.push(item)
    }

    this.allItemsCache = items
    this.allItemsCacheIndexById = indexById
  }

  /** Сбрасывает кэш массива, чтобы пересобрать его лениво. */
  private invalidateAllItemsCache(): void {
    this.allItemsCache = null
    this.allItemsCacheIndexById = null
  }

  /** Определяет, когда массив порядка пора уплотнить. */
  private shouldCompactOrder(): boolean {
    return this.order.length > 32 && this.order.length >= this.itemsById.size * 2
  }

  /** Удаляет помеченные слоты и пересобирает индексы порядка. */
  private compactOrder(): void {
    const compactedOrder: TreeStoreId[] = []

    this.orderIndexById.clear()

    for (const slot of this.order) {
      if (slot === DELETED || !this.itemsById.has(slot)) {
        continue
      }

      this.orderIndexById.set(slot, compactedOrder.length)
      compactedOrder.push(slot)
    }

    this.order.length = 0
    this.order.push(...compactedOrder)
  }
}
