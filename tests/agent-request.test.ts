import assert from "node:assert/strict";
import test from "node:test";
import { parseAgentRequest } from "../lib/agent-request";

const valid = {
  workspaceId: "workspace-1",
  messages: [{ id: "msg-1", role: "user", parts: [{ type: "text", text: "Draw a flow" }] }],
  canvasContext: null,
  docContext: "(empty doc)",
};

test("accepts user prompts and preserves surface context", async () => {
  const parsed = await parseAgentRequest(valid);
  assert.equal(parsed?.workspaceId, valid.workspaceId);
  assert.deepEqual(parsed?.messages, valid.messages);
  assert.equal(parsed?.docContext, valid.docContext);
});

test("rejects malformed request bodies and invalid messages", async () => {
  for (const body of [null, [], {}, { ...valid, workspaceId: " " },
    { ...valid, messages: [] }, { ...valid, messages: [{ role: "user" }] },
    { ...valid, canvasContext: {} }, { ...valid, messages: "bad" }]) {
    assert.equal(await parseAgentRequest(body), null);
  }
});

test("accepts completed client tool calls used by automatic follow-ups", async () => {
  const parsed = await parseAgentRequest({ ...valid, messages: [...valid.messages, {
    id: "assistant-1", role: "assistant", parts: [{
      type: "tool-replaceDoc", toolCallId: "call-1", state: "output-available",
      input: { markdown: "# Plan" }, output: { success: true },
    }],
  }] });
  assert.equal(parsed?.messages.length, 2);
});
