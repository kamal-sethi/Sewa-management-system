"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FIELD_CONFIG = [
  { name: "driverName", label: "Name of Driver" },
  { name: "busNumber", label: "Bus No" },
  { name: "jathedarName", label: "Name of Jathedar" },
  {
    name: "jathedarMobileNumber",
    label: "Jathedar Mobile Number",
    type: "tel",
    placeholder: "10-digit mobile number",
  },
  {
    name: "sewaDuration",
    label: "Duration of Sewa",
    placeholder: "20-04-2026 to 25-05-2026",
  },
  { name: "sewaName", label: "Name of Sewa" },
  { name: "nominalRollId", label: "Nominal Roll ID" },
];

export default function PrintSheetModal({ sheet, onClose, onSaved }) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    FIELD_CONFIG.reduce(
      (values, field) => ({
        ...values,
        [field.name]: sheet?.[field.name] || "",
      }),
      {},
    ),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showExtraLinesPrompt, setShowExtraLinesPrompt] = useState(false);
  const [extraLines, setExtraLines] = useState("5");
  const [savedSheet, setSavedSheet] = useState(null);

  const isComplete = FIELD_CONFIG.every((field) => form[field.name]?.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isComplete) {
      setError("Please fill all fields before printing.");
      return;
    }

    if (form.jathedarMobileNumber.length !== 10) {
      setError("Jathedar mobile number must be exactly 10 digits.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/sheets/${sheet._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to save print details.");
        return;
      }

      setSavedSheet(data.data);
      setShowExtraLinesPrompt(true);
    } catch {
      setError("Failed to save print details.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const normalizedValue = extraLines.trim();

    if (!/^\d+$/.test(normalizedValue)) {
      setError("Please enter 0 or a valid number of extra lines.");
      return;
    }

    setError("");
    if (savedSheet) {
      onSaved(savedSheet);
    }
    onClose();
    router.push(`/nominalRoll/${sheet._id}?extraLines=${normalizedValue}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          className="mb-4 text-xl font-bold text-stone-800"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Print Sheet Details
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELD_CONFIG.map((field) => (
              <div key={field.name}>
                <label className="mb-1 block text-sm font-medium text-stone-700">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <input
                  type={field.type || "text"}
                  className="input-field"
                  value={form[field.name]}
                  placeholder={field.placeholder || ""}
                  onChange={(event) => {
                    const value =
                      field.name === "jathedarMobileNumber"
                        ? event.target.value.replace(/\D/g, "").slice(0, 10)
                        : event.target.value;

                    setForm((current) => ({
                      ...current,
                      [field.name]: value,
                    }));
                  }}
                  maxLength={field.name === "jathedarMobileNumber" ? 10 : undefined}
                  required
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
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
              disabled={saving || !isComplete}
              className="btn-primary flex-1"
            >
              {saving ? "Saving..." : "Save & Preview"}
            </button>
          </div>
        </form>

        {showExtraLinesPrompt && (
          <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <h3 className="mb-2 text-base font-semibold text-stone-800">
              Extra Blank Lines
            </h3>
            <p className="mb-3 text-sm text-stone-500">
              Enter how many empty lines to leave in the print document. Use
              `0` if you do not want any extra lines.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="number"
                min="0"
                step="1"
                className="input-field"
                value={extraLines}
                onChange={(event) =>
                  setExtraLines(
                    event.target.value.replace(/[^\d]/g, ""),
                  )
                }
              />
              <button
                type="button"
                onClick={handlePreview}
                className="btn-primary sm:min-w-40"
              >
                Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
