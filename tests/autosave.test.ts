import assert from "node:assert/strict";
import test from "node:test";
import { createAutosave } from "../lib/autosave";

test("debounces edits and flushes the latest snapshot on disposal", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let value = "first";
  const writes: string[] = [];
  const saver = createAutosave(() => value, async (v) => { writes.push(v); }, (error) => { throw error; }, 1000);
  saver.schedule();
  t.mock.timers.tick(500);
  value = "latest";
  saver.schedule();
  t.mock.timers.tick(500);
  assert.deepEqual(writes, []);
  const done = saver.dispose();
  value = "disposed editor";
  await done;
  assert.deepEqual(writes, ["latest"]);
  saver.schedule();
  t.mock.timers.tick(2000);
  await saver.dispose();
  assert.deepEqual(writes, ["latest"]);
});

test("serializes slow saves so an older snapshot cannot finish last", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let value = 1;
  let release!: () => void;
  const started: number[] = [];
  const saver = createAutosave(() => value, async (v) => {
    started.push(v);
    if (v === 1) await new Promise<void>((resolve) => { release = resolve; });
  }, (error) => { throw error; }, 1000);
  saver.schedule();
  t.mock.timers.tick(1000);
  await Promise.resolve();
  value = 2;
  saver.schedule();
  const done = saver.dispose();
  await Promise.resolve();
  assert.deepEqual(started, [1]);
  release();
  await done;
  assert.deepEqual(started, [1, 2]);
});

test("reports a failed write and allows the next save to succeed", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let value = 1;
  const writes: number[] = [];
  const errors: unknown[] = [];
  const saver = createAutosave(() => value, async (v) => {
    if (v === 1) throw new Error("offline");
    writes.push(v);
  }, (error) => errors.push(error), 1000);
  saver.schedule();
  t.mock.timers.tick(1000);
  value = 2;
  saver.schedule();
  await saver.dispose();
  assert.equal(errors.length, 1);
  assert.deepEqual(writes, [2]);
});

test("orders writes across editor remounts for the same workspace", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let release!: () => void;
  const writes: string[] = [];
  const oldEditor = createAutosave(() => "old", async (v) => {
    writes.push(v);
    await new Promise<void>((resolve) => { release = resolve; });
  }, (error) => { throw error; }, 1000, "canvas:remount-test");
  oldEditor.schedule();
  const oldDone = oldEditor.dispose();
  await Promise.resolve();
  const newEditor = createAutosave(() => "new", async (v) => { writes.push(v); },
    (error) => { throw error; }, 1000, "canvas:remount-test");
  newEditor.schedule();
  const newDone = newEditor.dispose();
  await Promise.resolve();
  assert.deepEqual(writes, ["old"]);
  release();
  await Promise.all([oldDone, newDone]);
  assert.deepEqual(writes, ["old", "new"]);
});
