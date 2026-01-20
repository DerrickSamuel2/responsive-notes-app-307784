import { useEffect, useRef, useState } from "react";

/**
 * Safely parse JSON from localStorage and validate with a provided predicate.
 * Returns undefined if invalid/unavailable.
 */
function safeRead(key, validate) {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (validate && !validate(parsed)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

/**
 * Default validator for notes array.
 * Notes are simple objects with {id, title, body, createdAt, updatedAt}.
 */
function defaultNotesValidator(value) {
  if (!Array.isArray(value)) return false;
  for (const n of value) {
    if (!n || typeof n !== "object") return false;
    if (typeof n.id !== "string") return false;
    if (typeof n.title !== "string") return false;
    if (typeof n.body !== "string") return false;
    if (typeof n.createdAt !== "number") return false;
    if (typeof n.updatedAt !== "number") return false;
  }
  return true;
}

// PUBLIC_INTERFACE
export default function useLocalStorageState(key, defaultValue, options = {}) {
  /**
   * A small, resilient localStorage state hook:
   * - reads once on mount
   * - validates shape to avoid app crashes due to corrupted storage
   * - writes after state changes
   */
  const validate = options.validate || defaultNotesValidator;
  const [value, setValue] = useState(() => {
    const fromStorage = safeRead(key, validate);
    return fromStorage !== undefined ? fromStorage : defaultValue;
  });

  const didInitRef = useRef(false);

  useEffect(() => {
    // Avoid writing on first render if we just loaded from storage (or set default)
    // but do ensure we keep storage consistent if default is used.
    if (!didInitRef.current) {
      didInitRef.current = true;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // If storage is full/blocked, fail silently: app remains usable for the session.
    }
  }, [key, value]);

  return [value, setValue];
}
