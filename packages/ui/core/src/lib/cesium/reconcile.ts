/**
 * Diff utilities for keeping a `Cesium.EntityCollection` in sync with a
 * controlled array of plain data records, keyed by `id`.
 *
 * Why this exists: rebuilding the whole collection on every prop change is
 * expensive (each entity rebind triggers Cesium primitive re-creation).
 * Diffing lets us touch only the records that actually changed.
 */

type EntityCollection = {
  getById: (id: string) => unknown;
  remove: (entity: unknown) => boolean;
  values: ReadonlyArray<unknown>;
};

export type ReconcileOps<T extends { id: string }> = {
  added: T[];
  /** Records present on both sides. The caller usually updates them in place. */
  updated: T[];
  /** Entity ids that were dropped — caller should remove them. */
  removedIds: string[];
};

export function diffById<T extends { id: string }>(
  previous: ReadonlyArray<T>,
  next: ReadonlyArray<T>,
): ReconcileOps<T> {
  const prevIds = new Set(previous.map((p) => p.id));
  const nextIds = new Set(next.map((p) => p.id));
  const added: T[] = [];
  const updated: T[] = [];
  for (const item of next) {
    if (prevIds.has(item.id)) updated.push(item);
    else added.push(item);
  }
  const removedIds: string[] = [];
  for (const id of prevIds) if (!nextIds.has(id)) removedIds.push(id);
  return { added, updated, removedIds };
}

/**
 * Remove every entity from `collection` whose id matches one in `ids`.
 * Returns the number of entities that were actually removed.
 */
export function removeEntitiesById(
  collection: EntityCollection,
  ids: ReadonlyArray<string>,
): number {
  let n = 0;
  for (const id of ids) {
    const e = collection.getById(id);
    if (e && collection.remove(e)) n++;
  }
  return n;
}
