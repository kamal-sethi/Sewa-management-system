// components/SheetCard.js
"use client";
import { useState } from "react";
import Link from "next/link";

export default function SheetCard({ sheet, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);

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
      setConfirm(false);
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

        {confirm ? (
          <div className="flex gap-1.5">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs px-2 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="text-xs px-2 py-1.5 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}