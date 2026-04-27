// components/AutocompleteInput.js
"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export default function AutocompleteInput({ onPersonSelected, onNotFound }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (val) => {
    if (!val.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/people/search?name=${encodeURIComponent(val)}`
      );
      const data = await res.json();
      if (data.success) {
        setSuggestions(data.data);
        setShowDropdown(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    // Debounce API call by 300ms
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (person) => {
    setQuery(person.name);
    setShowDropdown(false);
    setSuggestions([]);
    onPersonSelected(person);
  };

  const handleAddNew = () => {
    setShowDropdown(false);
    onNotFound(query);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        className="input-field pr-8"
        placeholder="Type name to search..."
        value={query}
        onChange={handleChange}
        onFocus={() => query && setShowDropdown(true)}
        autoComplete="off"
      />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((person) => (
                <button
                  key={person._id}
                  type="button"
                  onClick={() => handleSelect(person)}
                  className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-stone-100 last:border-0"
                >
                  <p className="text-sm font-medium text-stone-800">
                    {person.name}
                  </p>
                  <p className="text-xs text-stone-500">
                    {person.fatherOrHusbandName} · {person.age}y ·{" "}
                    {person.gender}
                  </p>
                </button>
              ))}
              <div className="border-t border-stone-100 px-4 py-3 bg-stone-50">
                <p className="mb-2 text-xs text-stone-500">
                  Can&apos;t find the correct person?
                </p>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="text-sm font-medium text-orange-600 hover:underline"
                >
                  + Add new person named &quot;{query}&quot;
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm text-stone-500 mb-2">
                No record found for &quot;{query}&quot;
              </p>
              <button
                type="button"
                onClick={handleAddNew}
                className="text-sm text-orange-600 font-medium hover:underline"
              >
                + Add &quot;{query}&quot; as new person
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
