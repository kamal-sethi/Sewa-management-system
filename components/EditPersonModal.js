"use client";
import { useState } from "react";

export default function EditPersonModal({ person, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: person?.name || "",
    fatherOrHusbandName: person?.fatherOrHusbandName || "",
    age: person?.age || "",
    gender: person?.gender || "Male",
    mobileNumber: person?.mobileNumber || "",
    aadharNumber: person?.aadharNumber || "",
    address: person?.address || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "mobileNumber" || name === "aadharNumber") {
      const maxLength = name === "mobileNumber" ? 10 : 12;
      const digitsOnly = value.replace(/\D/g, "").slice(0, maxLength);
      setForm((current) => ({ ...current, [name]: digitsOnly }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name || !form.fatherOrHusbandName || !form.age || !form.gender) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.mobileNumber && form.mobileNumber.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    if (form.aadharNumber && form.aadharNumber.length !== 12) {
      setError("Aadhaar number must be exactly 12 digits.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/people/${person._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to update person.");
        return;
      }

      onUpdated(data.data);
    } catch {
      setError("Failed to update person. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box max-w-lg w-full"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          className="mb-4 text-xl font-bold text-stone-800"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Edit Person
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Father / Husband Name <span className="text-red-500">*</span>
              </label>
              <input
                name="fatherOrHusbandName"
                value={form.fatherOrHusbandName}
                onChange={handleChange}
                className="input-field"
                placeholder="Father or husband name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                name="age"
                type="number"
                value={form.age}
                onChange={handleChange}
                className="input-field"
                placeholder="Age"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Mobile Number
            </label>
            <input
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="10-digit mobile number"
              type="tel"
              maxLength={10}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Aadhaar Number
            </label>
            <input
              name="aadharNumber"
              value={form.aadharNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="12-digit Aadhaar number"
              type="tel"
              maxLength={12}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-stone-600">
              Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input-field resize-none"
              rows={2}
              placeholder="Full address"
            />
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
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
