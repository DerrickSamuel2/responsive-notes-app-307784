import React, { useCallback, useMemo, useState } from "react";
import "./App.css";
import NotesList from "./components/NotesList";
import NoteFormModal from "./components/NoteFormModal";
import useLocalStorageState from "./hooks/useLocalStorageState";

/**
 * Generates a reasonably unique id for client-side objects.
 * Uses crypto.randomUUID when available; falls back to timestamp + random.
 */
function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const STORAGE_KEY = "notesApp.notes";

/** Default seed notes for first-time use (kept minimal). */
const DEFAULT_NOTES = [];

// PUBLIC_INTERFACE
function App() {
  /** Persisted notes (no backend). */
  const [notes, setNotes] = useLocalStorageState(STORAGE_KEY, DEFAULT_NOTES);

  /** UI state */
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // null => creating

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;

    return notes.filter((n) => {
      const title = (n.title || "").toLowerCase();
      const body = (n.body || "").toLowerCase();
      return title.includes(q) || body.includes(q);
    });
  }, [notes, query]);

  const notesCountLabel = useMemo(() => {
    const total = notes.length;
    const shown = filteredNotes.length;
    if (query.trim() && shown !== total) return `${shown} of ${total}`;
    return `${total}`;
  }, [notes.length, filteredNotes.length, query]);

  const openCreate = useCallback(() => {
    setEditingNote(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    // Keep editingNote until modal closes; then clear so next open is clean.
    setTimeout(() => setEditingNote(null), 0);
  }, []);

  const upsertNote = useCallback(
    ({ id, title, body }) => {
      const now = Date.now();

      // Normalize whitespace but keep user's formatting in body.
      const normalizedTitle = title.trim();
      const normalizedBody = body.trim();

      if (!id) {
        const created = {
          id: generateId(),
          title: normalizedTitle,
          body: normalizedBody,
          createdAt: now,
          updatedAt: now,
        };
        setNotes((prev) => [created, ...prev]);
        return;
      }

      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                title: normalizedTitle,
                body: normalizedBody,
                updatedAt: now,
              }
            : n
        )
      );
    },
    [setNotes]
  );

  const deleteNote = useCallback(
    (id) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotes]
  );

  const clearAllNotes = useCallback(() => {
    // Confirm is intentionally used here: destructive operation with no backend undo.
    // eslint-disable-next-line no-alert
    const ok = window.confirm("Delete all notes? This cannot be undone.");
    if (!ok) return;
    setNotes([]);
  }, [setNotes]);

  return (
    <div className="App">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              N
            </div>
            <div className="brand-text">
              <h1 className="app-title">Notes</h1>
              <p className="app-subtitle">Fast, local, and private (stored on this device)</p>
            </div>
          </div>

          <div className="header-actions">
            <div className="search">
              <label className="sr-only" htmlFor="searchNotes">
                Search notes
              </label>
              <input
                id="searchNotes"
                className="input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes…"
                autoComplete="off"
              />
              <div className="search-meta" aria-live="polite">
                <span className="count-pill" title="Notes shown">
                  {notesCountLabel}
                </span>
              </div>
            </div>

            <button type="button" className="btn btn-secondary" onClick={clearAllNotes} disabled={notes.length === 0}>
              Clear all
            </button>

            <button type="button" className="btn btn-primary" onClick={openCreate}>
              New note
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="app-main">
        <NotesList
          notes={filteredNotes}
          onEdit={openEdit}
          onDelete={deleteNote}
          emptyState={{
            title: query.trim() ? "No matching notes" : "No notes yet",
            description: query.trim()
              ? "Try a different search term, or create a new note."
              : "Create your first note to get started.",
            ctaLabel: "Create note",
            onCta: openCreate,
          }}
        />
      </main>

      <button type="button" className="fab" onClick={openCreate} aria-label="Add note">
        <span className="fab-plus" aria-hidden="true">
          +
        </span>
      </button>

      <NoteFormModal
        isOpen={isModalOpen}
        mode={editingNote ? "edit" : "create"}
        note={editingNote}
        onClose={closeModal}
        onSave={(payload) => {
          upsertNote(payload);
          closeModal();
        }}
      />
    </div>
  );
}

export default App;
