import { safeValidateUIMessages, type InferUITools, type UIDataTypes, type UIMessage } from "ai";
import { z } from "zod";
import { agentToolDefs } from "@/lib/agent-tools";

const requestSchema = z.object({
  workspaceId: z.string().trim().min(1),
  messages: z.array(z.unknown()).min(1),
  canvasContext: z.string().nullish(),
  docContext: z.string().nullish(),
});

export async function parseAgentRequest(body: unknown) {
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return null;
  const validated = await safeValidateUIMessages<UIMessage<unknown, UIDataTypes, InferUITools<typeof agentToolDefs>>>({
    messages: parsed.data.messages,
    tools: agentToolDefs,
  });
  if (!validated.success) return null;
  return { ...parsed.data, messages: validated.data };
}
