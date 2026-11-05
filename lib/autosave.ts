const pendingWrites = new Map<string, Promise<void>>();

// Capture snapshots while the editor is alive. A workspace key also orders writes
// across view changes/remounts within this browser tab (not between collaborators).
export function createAutosave<T>(
  snapshot: () => T,
  persist: (value: T) => Promise<unknown>,
  onError: (error: unknown) => void,
  delay = 1000,
  queueKey?: string,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let queue = Promise.resolve();

  const flush = () => {
    if (timer === undefined) return queue;
    clearTimeout(timer);
    timer = undefined;
    try {
      const value = snapshot();
      const previous = (queueKey && pendingWrites.get(queueKey)) || queue;
      queue = previous.then(() => persist(value)).then(() => {}, onError);
      if (queueKey) {
        pendingWrites.set(queueKey, queue);
        const current = queue;
        const release = () => {
          if (pendingWrites.get(queueKey) === current) pendingWrites.delete(queueKey);
        };
        void current.then(release, release);
      }
    } catch (error) {
      onError(error);
    }
    return queue;
  };

  return {
    schedule() {
      if (disposed) return;
      clearTimeout(timer);
      timer = setTimeout(flush, delay);
    },
    dispose() {
      disposed = true;
      return flush();
    },
  };
}
