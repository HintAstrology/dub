export type CachedLoaderOptions<Input, Value> = {
  getKey: (input: Input) => string;
  loadResource: (input: Input) => Promise<Value | null>;
  cache?: Map<string, Value>;
  onError?: (input: Input, error: unknown) => void;
};

export type CachedLoader<Input, Value> = {
  cache: Map<string, Value>;
  load: (input: Input) => Promise<Value | null>;
  has: (input: Input) => boolean;
  clear: (input?: Input) => void;
};

export const createCachedLoader = <Input, Value>(
  options: CachedLoaderOptions<Input, Value>,
): CachedLoader<Input, Value> => {
  const { getKey, loadResource, onError } = options;
  const cache = options.cache ?? new Map<string, Value>();

  const load = async (input: Input): Promise<Value | null> => {
    const key = getKey(input);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    try {
      const value = await loadResource(input);

      if (value !== null && value !== undefined) {
        cache.set(key, value);
      }

      return value ?? null;
    } catch (error) {
      onError?.(input, error);
      return null;
    }
  };

  const has = (input: Input) => cache.has(getKey(input));

  const clear = (input?: Input) => {
    if (!input) {
      cache.clear();
      return;
    }

    cache.delete(getKey(input));
  };

  return { cache, load, has, clear };
};
