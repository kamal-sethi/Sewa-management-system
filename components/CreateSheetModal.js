// components/CreateSheetModal.js
"use client";
import { useState } from "react";

export default function CreateSheetModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to create sheet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2
          className="text-xl font-bold text-stone-800 mb-4"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Create New Sheet
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Sewa Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Langar Sewa - June 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary flex-1"
            >
              {loading ? "Creating..." : "Create Sheet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}