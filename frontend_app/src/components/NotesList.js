import React from "react";
import NoteItem from "./NoteItem";

// PUBLIC_INTERFACE
export default function NotesList({ notes, onEdit, onDelete, emptyState }) {
  if (!notes || notes.length === 0) {
    return (
      <section className="empty" aria-live="polite">
        <h2>{emptyState?.title || "No notes"}</h2>
        <p>{emptyState?.description || "Create a note to get started."}</p>
        {emptyState?.onCta && (
          <button type="button" className="btn btn-primary" onClick={emptyState.onCta}>
            {emptyState?.ctaLabel || "Create note"}
          </button>
        )}
      </section>
    );
  }

  return (
    <section aria-label="Notes">
      <div className="notes-grid">
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}
