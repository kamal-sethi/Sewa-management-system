// components/RecordRow.js
"use client";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getFareAmount } from "@/lib/fare";
import EditPersonModal from "@/components/EditPersonModal";
import { Pencil, Trash2 } from "lucide-react";

export default function RecordRow({
  record,
  index,
  onUpdated,
  onDeleted,
  isSearchMatch = false,
}) {
  const person = record.personId;
  const [fare, setFare] = useState(record.fare ?? "");
  const [remarks, setRemarks] = useState(record.remarks ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingPerson, setEditingPerson] = useState(false);
  const skipNextRecordSaveRef = useRef(false);
  const remarksRef = useRef(null);

  const handleSaveRecord = async () => {
    if (skipNextRecordSaveRef.current) {
      skipNextRecordSaveRef.current = false;
      return;
    }

    const savedFare = record.fare ?? "";
    const savedRemarks = record.remarks ?? "";

    if (fare === savedFare && remarks === savedRemarks) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/records/${record._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fare, remarks }),
      });
      const data = await res.json();
      if (data.success) {
        onUpdated(data.data);
        setFare(data.data.fare ?? "");
        setRemarks(data.data.remarks ?? "");
      }
    } catch (err) {
      console.error(err);
      setFare(savedFare);
      setRemarks(savedRemarks);
    } finally {
      setSaving(false);
    }
  };

  const handleInlineKeyDown = (event) => {
    if (event.key === "Enter") {
      if (event.currentTarget.tagName.toLowerCase() === "textarea") {
        return;
      }

      event.preventDefault();
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      skipNextRecordSaveRef.current = true;
      setFare(record.fare ?? "");
      setRemarks(record.remarks ?? "");
      event.currentTarget.blur();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/records/${record._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) onDeleted(record._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const rowClassName = isSearchMatch
    ? "bg-yellow-100 ring-2 ring-yellow-400"
    : "hover:bg-stone-50";

  const autoResizeRemarks = (element) => {
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  };

  return (
    <>
      <tr
        id={`record-${record._id}`}
        className={`transition-colors group ${rowClassName}`}
      >
        <td className="border border-stone-300 px-3 py-2.5 text-center text-stone-700 text-sm font-bold">
          {index}
        </td>

        <td className="border border-stone-300 px-2 py-2.5 text-sm text-center align-middle">
          <input
            type="text"
            className={`w-full text-center text-xs bg-transparent border-none focus:outline-none focus:ring-0 ${
              getFareAmount(fare) > 0 ? "font-medium text-green-600" : ""
            }`}
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            onBlur={handleSaveRecord}
            onKeyDown={handleInlineKeyDown}
            disabled={saving}
            placeholder="Amount or N/A"
          />
        </td>

        <td className="border border-stone-300 px-2 py-2.5 text-sm align-middle">
          <textarea
            ref={(element) => {
              remarksRef.current = element;
              autoResizeRemarks(element);
            }}
            rows={1}
            className="w-full resize-none overflow-hidden whitespace-normal break-words bg-transparent text-xs leading-snug border-none focus:outline-none focus:ring-0"
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              autoResizeRemarks(e.target);
            }}
            onBlur={handleSaveRecord}
            onKeyDown={handleInlineKeyDown}
            disabled={saving}
            placeholder="Add remark..."
          />
        </td>

        <td className="border border-stone-300 px-3 py-2.5">
          <span className="block max-w-full whitespace-normal break-words text-base font-bold leading-snug text-stone-800 uppercase">
            {person?.name}
          </span>
        </td>

        <td className="border border-stone-300 px-3 py-2.5 text-base font-bold leading-snug text-stone-700 uppercase whitespace-normal break-words">
          {person?.fatherOrHusbandName}
        </td>

        <td className="border border-stone-300 px-3 py-2.5 text-sm text-stone-600 text-center">
          {person?.age}
        </td>

        <td className="border border-stone-300 px-3 py-2.5 text-sm text-stone-600 text-center">
          {person?.gender === "Male"
            ? "M"
            : person?.gender === "Female"
              ? "F"
              : "-"}
        </td>

        <td className="border border-stone-300 px-3 py-2.5 text-sm text-stone-600 whitespace-normal break-words">
          {person?.mobileNumber || <span className="text-stone-300">-</span>}
        </td>

        <td className="border border-stone-300 px-3 py-2.5 text-base font-bold leading-snug text-stone-700 uppercase whitespace-normal break-words">
          {person?.address || <span className="text-stone-300">-</span>}
        </td>

        <td className="border border-stone-300 px-3 py-2.5">
          <div className="flex gap-1">
            <button
              onClick={() => setEditingPerson(true)}
              className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              title="Edit person details"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 bg-red-100 text-red-500 rounded hover:bg-red-200"
              title="Remove from sheet"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {confirmDelete &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-bold text-stone-800">
                Wanna delete this record
              </h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-primary flex-1"
                >
                  {deleting ? "Deleting..." : "OK"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {editingPerson && (
        <EditPersonModal
          person={person}
          onClose={() => setEditingPerson(false)}
          onUpdated={(updatedPerson) => {
            onUpdated({ ...record, personId: updatedPerson });
            setEditingPerson(false);
          }}
        />
      )}
    </>
  );
}
