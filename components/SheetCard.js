// components/SheetCard.js
"use client";
import { useState } from "react";
import Link from "next/link";
import EditSheetModal from "@/components/EditSheetModal";

export default function SheetCard({ sheet, onDeleted, onUpdated }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleUpdated = (updatedSheet) => {
    setShowEditModal(false);
    if (onUpdated) onUpdated(updatedSheet);
  };

  return (
    <div className="group relative rounded-xl border border-stone-200/90 bg-white p-3.5 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md flex flex-col justify-between gap-3">
      {/* Icon + Name + Edit Button */}
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <h3
            className="text-sm font-semibold text-stone-800 break-words leading-snug"
            style={{ fontFamily: "'Baloo 2', cursive" }}
            title={sheet.name}
          >
            {sheet.name}
          </h3>
          <p className="text-[11px] text-stone-400 mt-1">{formattedDate}</p>
        </div>

        {/* Edit Icon Only */}
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          title="Edit sheet name"
          className="cursor-pointer text-stone-400 hover:text-orange-600 hover:bg-orange-50 p-1 rounded-md transition-colors shrink-0"
          aria-label="Edit sheet name"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <Link
          href={`/sheets/${sheet._id}`}
          className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
        >
          Open sheet →
        </Link>

        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="cursor-pointer text-xs text-stone-400 hover:text-red-500 hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
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

      {showEditModal && (
        <EditSheetModal
          sheet={sheet}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
