import { describe, expect, it } from "vitest"
import { shouldUseCachedDataOnError } from "../src/utils/feedCache"
import type { DiscoveryItem } from "../src/types/DiscoveryItem"

const item = { id: "cached", title: "Cached item", raw: {} } as DiscoveryItem

describe("shouldUseCachedDataOnError", () => {
  it("uses cached data after errors only when the source allows fallback", () => {
    expect(shouldUseCachedDataOnError(true, [item])).toBe(true)
    expect(shouldUseCachedDataOnError(false, [item])).toBe(false)
    expect(shouldUseCachedDataOnError(undefined, [item])).toBe(false)
    expect(shouldUseCachedDataOnError(true, [])).toBe(false)
  })
})
