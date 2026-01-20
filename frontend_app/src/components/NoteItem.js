import React, { useMemo } from "react";

function formatTimestamp(ms) {
  try {
    return new Date(ms).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// PUBLIC_INTERFACE
export default function NoteItem({ note, onEdit, onDelete }) {
  const updatedLabel = useMemo(() => formatTimestamp(note.updatedAt), [note.updatedAt]);
  const title = note.title?.trim() ? note.title : "Untitled";

  return (
    <article className="note-card" aria-label={`Note: ${title}`}>
      <div className="note-header">
        <h3 className="note-title">{title}</h3>
        <div className="note-actions" aria-label="Note actions">
          <button type="button" className="btn btn-ghost" onClick={() => onEdit(note)} aria-label={`Edit note: ${title}`}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              // eslint-disable-next-line no-alert
              const ok = window.confirm("Delete this note?");
              if (ok) onDelete(note.id);
            }}
            aria-label={`Delete note: ${title}`}
          >
            Delete
          </button>
        </div>
      </div>

      {note.body?.trim() ? <p className="note-body">{note.body}</p> : <p className="note-body" style={{ color: "#64748b" }}>No content.</p>}

      <div className="note-meta">
        <span title={`Last updated: ${updatedLabel}`}>Updated {updatedLabel}</span>
        <span style={{ color: "transparent" }} aria-hidden="true">
          .
        </span>
      </div>
    </article>
  );
}
