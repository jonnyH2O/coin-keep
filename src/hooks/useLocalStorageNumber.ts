import { useCallback, useState } from 'react';

/**
 * A number backed by localStorage under `key`, so it survives an accidental
 * refresh mid-game. Not meant to be a durable record — see docs/VISION.md.
 */
export function useLocalStorageNumber(key: string, initial: number): [number, (next: number) => void] {
  const [value, setValue] = useState<number>(() => {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return initial;
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : initial;
  });

  const update = useCallback(
    (next: number) => {
      setValue(next);
      window.localStorage.setItem(key, String(next));
    },
    [key],
  );

  return [value, update];
}
