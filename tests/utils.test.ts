import assert from "node:assert/strict";
import test from "node:test";
import type { KeyboardEvent } from "react";
import { submitOnEnter } from "../lib/utils";

test("Enter submits, but Shift+Enter and IME confirmation do not", () => {
  let submits = 0;
  let prevented = 0;
  const handle = submitOnEnter(() => submits++);
  const event = (shiftKey: boolean, isComposing: boolean) => ({
    key: "Enter", shiftKey, nativeEvent: { isComposing },
    preventDefault: () => prevented++,
  }) as unknown as KeyboardEvent;
  handle(event(true, false));
  handle(event(false, true));
  assert.equal(submits, 0);
  assert.equal(prevented, 0);
  handle(event(false, false));
  assert.equal(submits, 1);
  assert.equal(prevented, 1);
});
