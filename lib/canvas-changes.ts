import type { TLStore } from "tldraw";

// store.listen batches until the next animation frame. Synchronous side effects
// mark pending edits immediately, including a final edit just before unmount.
export function listenToCanvasChanges(store: Pick<TLStore, "schema" | "sideEffects">, onChange: () => void) {
  const notify = (source: "user" | "remote") => {
    if (source === "user") onChange();
  };
  const cleanup: (() => void)[] = [];
  for (const type of Object.values(store.schema.types)) {
    if (type.scope !== "document") continue;
    cleanup.push(
      store.sideEffects.registerAfterCreateHandler(type.typeName, (_record, source) => notify(source)),
      store.sideEffects.registerAfterChangeHandler(type.typeName, (_prev, _next, source) => notify(source)),
      store.sideEffects.registerAfterDeleteHandler(type.typeName, (_record, source) => notify(source)),
    );
  }
  return () => cleanup.forEach((stop) => stop());
}
