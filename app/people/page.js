// app/people/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import AddPersonModal from "@/components/AddPersonModal";

export default function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  const fetchPeople = useCallback(async (query = "") => {
    setSearching(true);
    try {
      const url = query
        ? `/api/people/search?name=${encodeURIComponent(query)}`
        : `/api/people/search?name=`; // returns empty if no query — we handle below
      // For "all people" view we query with a broad match
      const res = query
        ? await fetch(url)
        : await fetch("/api/people/search?name=a"); // broad fetch hack — replace with proper /api/people GET in real app
      const data = await res.json();
      if (data.success) setPeople(data.data);
    } catch {
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchPeople(val);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-stone-800"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            People Database
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            All registered volunteers and sewadars
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          + Add Person
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="input-field max-w-sm"
          placeholder="Search by name..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : people.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-stone-500 text-sm">
            {search ? `No results for "${search}"` : "No people added yet"}
          </p>
        </div>
      ) : (
        <div className="card table-scroll">
          <table className="w-full text-left" style={{ minWidth: "700px" }}>
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                {[
                  "#",
                  "Name",
                  "Father/Husband",
                  "Age",
                  "Gender",
                  "Mobile",
                  "Address",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {people.map((person, i) => (
                <PersonRow
                  key={person._id}
                  person={person}
                  index={i + 1}
                  onUpdated={(updated) =>
                    setPeople((prev) =>
                      prev.map((p) => (p._id === updated._id ? updated : p)),
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddPersonModal
          onClose={() => setShowAdd(false)}
          onAdded={(p) => {
            setPeople((prev) => [p, ...prev]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function PersonRow({ person, index, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...person });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/people/${person._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        onUpdated(data.data);
        setEditing(false);
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <tr className="bg-orange-50">
        <td className="px-3 py-2 text-stone-400 text-sm">{index}</td>
        {["name", "fatherOrHusbandName"].map((field) => (
          <td key={field} className="px-3 py-2">
            <input
              className="input-field text-xs"
              value={form[field]}
              onChange={(e) =>
                setForm((p) => ({ ...p, [field]: e.target.value }))
              }
            />
          </td>
        ))}
        <td className="px-3 py-2">
          <input
            className="input-field text-xs w-16"
            type="number"
            value={form.age}
            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
          />
        </td>
        <td className="px-3 py-2">
          <select
            className="input-field text-xs"
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </td>
        <td className="px-3 py-2">
          <input
            className="input-field text-xs"
            value={form.mobileNumber}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
              }))
            }
            maxLength={10}
          />
        </td>
        <td className="px-3 py-2">
          <input
            className="input-field text-xs"
            value={form.address}
            onChange={(e) =>
              setForm((p) => ({ ...p, address: e.target.value }))
            }
          />
        </td>
        <td className="px-3 py-2">
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-2 py-1 bg-green-500 text-white rounded"
            >
              {saving ? "..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-xs px-2 py-1 bg-stone-200 rounded"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-stone-50 transition-colors group">
      <td className="px-3 py-2.5 text-stone-400 text-sm">{index}</td>
      <td className="px-3 py-2.5 font-medium text-stone-800 text-sm whitespace-nowrap">
        {person.name}
      </td>
      <td className="px-3 py-2.5 text-stone-600 text-sm">
        {person.fatherOrHusbandName}
      </td>
      <td className="px-3 py-2.5 text-stone-600 text-sm text-center">
        {person.age}
      </td>
      <td className="px-3 py-2.5 text-sm">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            person.gender === "Male"
              ? "bg-blue-100 text-blue-700"
              : person.gender === "Female"
                ? "bg-pink-100 text-pink-700"
                : "bg-stone-100 text-stone-600"
          }`}
        >
          {person.gender}
        </span>
      </td>
      <td className="px-3 py-2.5 text-stone-600 text-sm">
        {person.mobileNumber || "—"}
      </td>
      <td className="px-3 py-2.5 text-stone-600 text-sm max-w-[150px] truncate">
        {person.address || "—"}
      </td>
      <td className="px-3 py-2.5">
        <button
          onClick={() => setEditing(true)}
          className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-200"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}
