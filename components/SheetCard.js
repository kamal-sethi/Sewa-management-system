// components/SheetCard.js
"use client";
import { useState } from "react";
import Link from "next/link";

export default function SheetCard({ sheet, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const formattedDate = new Date(sheet.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sheets/${sheet._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) onDeleted(sheet._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Icon + Name */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">📋</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-stone-800 truncate"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {sheet.name}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">{formattedDate}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-stone-100">
        <Link
          href={`/sheets/${sheet._id}`}
          className="flex-1 text-center py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
        >
          Open →
        </Link>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div
            className="modal-box sm:max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <h3
              className="mb-2 text-lg font-bold text-stone-800"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Delete Sheet
            </h3>
            <p className="mb-4 text-sm text-stone-600">
              Are you sure you want to delete <strong>{sheet.name}</strong>?
              This will also remove all records inside this sheet.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={deleting}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex-1 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Sheet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
