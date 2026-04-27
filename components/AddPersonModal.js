// components/AddPersonModal.js
"use client";
import { useState } from "react";

const INITIAL = {
  name: "",
  fatherOrHusbandName: "",
  age: "",
  gender: "Male",
  mobileNumber: "",
  address: "",
};

export default function AddPersonModal({ initialName = "", onClose, onAdded }) {
  const [form, setForm] = useState({ ...INITIAL, name: initialName });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For mobile number, only allow digits and limit to 10
    if (name === "mobileNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.fatherOrHusbandName || !form.age || !form.gender) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.mobileNumber && form.mobileNumber.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        onAdded(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to add person. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="text-xl font-bold text-stone-800 mb-4"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Add New Person
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
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
              <label className="block text-xs font-medium text-stone-600 mb-1">
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
              <label className="block text-xs font-medium text-stone-600 mb-1">
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
              <label className="block text-xs font-medium text-stone-600 mb-1">
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
            <label className="block text-xs font-medium text-stone-600 mb-1">
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
            <label className="block text-xs font-medium text-stone-600 mb-1">
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
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Adding..." : "Add Person"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
