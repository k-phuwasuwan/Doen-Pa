import assert from "node:assert/strict";
import { test } from "node:test";
import { createLocalSnapshot, type StorageAdapter } from "../src/lib/storage/local-snapshot";

function memoryAdapter() {
  let raw: string | null = null;
  let failed = false;
  let subscriptions = 0;
  const listeners = new Set<() => void>();
  const adapter: StorageAdapter = {
    read: () => raw,
    write(value) { if (failed) throw new Error("QuotaExceededError"); raw = value; },
    subscribe(listener) {
      subscriptions++;
      listeners.add(listener);
      return () => { subscriptions--; listeners.delete(listener); };
    },
  };
  return { adapter, failWrites: () => { failed = true; }, subscriptions: () => subscriptions,
    externalChange(value: string | null) { raw = value; for (const listener of listeners) listener(); } };
}

test("decoded snapshots are stable and shared; server always uses neutral fallback", () => {
  const memory = memoryAdapter();
  const fallback: string[] = [];
  let decodes = 0;
  const store = createLocalSnapshot(memory.adapter, fallback, (raw) => { decodes++; return JSON.parse(raw) as string[]; });
  assert.equal(store.getSnapshot(), fallback);
  store.write(["saved"]);
  const first = store.getSnapshot();
  assert.deepEqual(first, ["saved"]);
  assert.equal(store.getSnapshot(), first);
  assert.equal(decodes, 1);
  assert.equal(store.getServerSnapshot(), fallback);
  memory.externalChange('["changed"]');
  assert.deepEqual(store.getSnapshot(), ["changed"]);
  assert.equal(decodes, 2);
});

test("one subscription covers several callers and notifies after successful write only", () => {
  const memory = memoryAdapter();
  const store = createLocalSnapshot(memory.adapter, [], (raw) => JSON.parse(raw) as string[]);
  const seen: string[][] = [];
  const offA = store.subscribe(() => seen.push(store.getSnapshot()));
  const offB = store.subscribe(() => seen.push(store.getSnapshot()));
  assert.equal(memory.subscriptions(), 1);
  store.write(["first"]);
  assert.deepEqual(seen, [["first"], ["first"]]);
  const before = store.getSnapshot();
  memory.failWrites();
  assert.throws(() => store.write(["lost"]), /QuotaExceeded/);
  assert.equal(store.getSnapshot(), before);
  assert.equal(seen.length, 2);
  offA();
  assert.equal(memory.subscriptions(), 1);
  offB();
  assert.equal(memory.subscriptions(), 0);
});

test("external changes, storage clear, and corrupt data publish correct fallback", () => {
  const memory = memoryAdapter();
  const fallback: string[] = [];
  const store = createLocalSnapshot(memory.adapter, fallback, (raw) => JSON.parse(raw) as string[]);
  const seen: string[][] = [];
  const off = store.subscribe(() => seen.push(store.getSnapshot()));
  memory.externalChange('["other tab"]');
  memory.externalChange('{invalid');
  memory.externalChange(null);
  assert.deepEqual(seen, [["other tab"], [], []]);
  assert.equal(seen[1], fallback);
  assert.equal(store.getSnapshot(), fallback);
  off();
});

test("unavailable reads return stable fallback and Date decoding happens once", () => {
  const fallback: Date[] = [];
  const inaccessible: StorageAdapter = { read() { throw new Error("SecurityError"); }, write() {}, subscribe: () => () => {} };
  const store = createLocalSnapshot(inaccessible, fallback, () => [new Date()]);
  assert.equal(store.getSnapshot(), fallback);
  assert.equal(store.getSnapshot(), fallback);
  const memory = memoryAdapter();
  const dates = createLocalSnapshot(memory.adapter, fallback, (raw) => (JSON.parse(raw) as string[]).map((date) => new Date(date)));
  dates.write([new Date("2026-01-01T12:00:00Z")]);
  assert.ok(dates.getSnapshot()[0] instanceof Date);
  assert.equal(dates.getSnapshot()[0].toISOString(), "2026-01-01T12:00:00.000Z");
  assert.equal(dates.getSnapshot()[0], dates.getSnapshot()[0]);
});
