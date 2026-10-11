import type { DiscoveryItem } from '../types/DiscoveryItem'
import type { LikeRecord } from './favoriteSync'
import { StorageAdapter } from './environment'

export const LOCAL_RECORDS_KEY = 'wikinote-liked-records-v1'
export const RECENT_RECORDS_KEY = 'wikinote-recent-articles-v1'
export interface RecentEntry { item: DiscoveryItem; seenAt: number }
let localChain: Promise<unknown> = Promise.resolve()

export async function withCollectionLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request('glimmer-local-collection', operation)
  const result = localChain.then(operation, operation)
  localChain = result.catch(() => undefined)
  return result
}

export function validRecords(value: unknown): LikeRecord[] {
  if (!Array.isArray(value)) return []
  return value.filter((record): record is LikeRecord => record && typeof record.id === 'string' && Number.isFinite(record.updatedAt) && (record.deleted === true || (record.item?.id === record.id && typeof record.item?.title === 'string' && record.item?.raw && typeof record.item?.source === 'string')))
}

export function mergeLocalRecords(local: Map<string, LikeRecord>, incoming: LikeRecord[]): Map<string, LikeRecord> {
  const result = new Map(local)
  for (const record of incoming) {
    const current = result.get(record.id)
    if (!current || record.updatedAt > current.updatedAt || (record.updatedAt === current.updatedAt && record.deleted)) result.set(record.id, record)
  }
  return result
}

export async function updateLocalFavorites(
  transform: (records: Map<string, LikeRecord>) => Map<string, LikeRecord>,
  legacy: Map<string, LikeRecord> = new Map(),
): Promise<Map<string, LikeRecord>> {
  return withCollectionLock(async () => {
    const stored = await StorageAdapter.get(LOCAL_RECORDS_KEY)
    const records = stored === null ? new Map(legacy) : new Map(validRecords(stored).map(record => [record.id, record]))
    const next = transform(records)
    // The record map is authoritative. Both writes stay inside the same lock.
    await StorageAdapter.set(LOCAL_RECORDS_KEY, [...next.values()])
    await StorageAdapter.set('likedArticles', [...next.values()].filter(record => !record.deleted && record.item).sort((a,b) => a.updatedAt - b.updatedAt).map(record => record.item!))
    return next
  })
}

export async function updateLocalRecent(transform: (records: RecentEntry[]) => RecentEntry[]): Promise<RecentEntry[]> {
  return withCollectionLock(async () => {
    const stored = await StorageAdapter.get<RecentEntry[]>(RECENT_RECORDS_KEY)
    const records = Array.isArray(stored) ? stored.filter(record => Number.isFinite(record?.seenAt) && typeof record.item?.id === 'string' && typeof record.item?.source === 'string' && record.item.raw) : []
    const next = transform(records).sort((a,b) => b.seenAt - a.seenAt).slice(0,30)
    await StorageAdapter.set(RECENT_RECORDS_KEY, next)
    return next
  })
}
