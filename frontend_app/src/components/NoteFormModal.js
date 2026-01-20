import React, { useEffect, useMemo, useRef, useState } from "react";

function useEscapeToClose(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
}

// PUBLIC_INTERFACE
export default function NoteFormModal({ isOpen, mode, note, onClose, onSave }) {
  const isEdit = mode === "edit";
  const titleText = isEdit ? "Edit note" : "New note";

  const [title, setTitle] = useState(note?.title || "");
  const [body, setBody] = useState(note?.body || "");
  const [error, setError] = useState("");

  const titleInputRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const modalId = useMemo(() => `note-modal-${isEdit ? "edit" : "create"}`, [isEdit]);

  useEscapeToClose(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocusedRef.current = document.activeElement;

    // Sync fields when opening
    setTitle(note?.title || "");
    setBody(note?.body || "");
    setError("");

    // Focus the title field after open
    setTimeout(() => titleInputRef.current?.focus(), 0);

    return () => {
      // Restore focus when closing (best-effort)
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === "function") {
        setTimeout(() => prev.focus(), 0);
      }
    };
  }, [isOpen, note]);

  if (!isOpen) return null;

  const canSubmit = title.trim().length > 0 || body.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();

    // Require at least one non-empty field so we don't create blank notes.
    if (!canSubmit) {
      setError("Please enter a title or some content.");
      return;
    }

    onSave({
      id: note?.id,
      title,
      body,
    });
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
      onMouseDown={(e) => {
        // Close when clicking the overlay (but not when clicking within modal)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id={`${modalId}-title`}>
            {titleText}
          </h2>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close modal">
            Close
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-row">
              <label htmlFor={`${modalId}-noteTitle`}>Title</label>
              <input
                id={`${modalId}-noteTitle`}
                ref={titleInputRef}
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Grocery list"
                maxLength={120}
              />
            </div>

            <div className="form-row">
              <label htmlFor={`${modalId}-noteBody`}>Content</label>
              <textarea
                id={`${modalId}-noteBody`}
                className="textarea"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your note…"
                maxLength={5000}
              />
            </div>

            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Save changes" : "Add note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
