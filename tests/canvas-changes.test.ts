import assert from "node:assert/strict";
import test from "node:test";
import { Store } from "@tldraw/store";
import { createTLSchema, PageRecordType, type TLStoreProps } from "@tldraw/tlschema";
import { ZERO_INDEX_KEY } from "@tldraw/utils";
import { listenToCanvasChanges } from "../lib/canvas-changes";

test("captures document changes synchronously, ignores remote edits and stops on cleanup", (t) => {
  // This store-only test does not mount an editor or use its asset/user adapters.
  const store = new Store({ schema: createTLSchema(), props: { defaultName: "Test" } as TLStoreProps });
  t.after(() => store.dispose());
  store.mergeRemoteChanges(() => {});
  let changes = 0;
  const stop = listenToCanvasChanges(store, () => changes++);
  const page = PageRecordType.create({ name: "Test page", index: ZERO_INDEX_KEY });
  store.put([page]);
  assert.equal(changes, 1);
  store.put([{ ...page, name: "Updated" }]);
  assert.equal(changes, 2);
  store.mergeRemoteChanges(() => store.put([{ ...page, name: "Remote" }]));
  assert.equal(changes, 2);
  store.remove([page.id]);
  assert.equal(changes, 3);
  stop();
  store.put([page]);
  assert.equal(changes, 3);
});
