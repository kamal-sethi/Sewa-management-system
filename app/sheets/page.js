"use client";

import { useEffect, useState } from "react";
import SheetCard from "@/components/SheetCard";
import CreateSheetModal from "@/components/CreateSheetModal";

function getMonthKey(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(value) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function SheetsPage() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadSheets() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/sheets");
        const data = await res.json();

        if (!active) return;

        if (data.success) {
          setSheets(Array.isArray(data.data) ? data.data : []);
          return;
        }

        throw new Error(data.message || "Failed to load sheets.");
      } catch (err) {
        if (!active) return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSheets();

    return () => {
      active = false;
    };
  }, []);

  const handleSheetCreated = (newSheet) => {
    setSheets((prev) => [newSheet, ...prev]);
    setShowCreate(false);
  };

  const handleSheetDeleted = (id) => {
    setSheets((prev) => prev.filter((sheet) => sheet._id !== id));
  };

  const monthOptions = Array.from(
    new Set(
      sheets
        .map((sheet) => getMonthKey(sheet.createdAt))
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a));

  const filteredSheets = sheets.filter((sheet) => {
    if (selectedMonth === "all") return true;
    return getMonthKey(sheet.createdAt) === selectedMonth;
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-stone-800"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Sewa Sheets
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {filteredSheets.length} sheet
            {filteredSheets.length !== 1 ? "s" : ""} shown
            {selectedMonth === "all"
              ? ` from ${sheets.length} total`
              : ` for ${formatMonthLabel(selectedMonth)}`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Filter by month
            </label>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="input-field min-w-[200px]"
            >
              <option value="all">All months</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <span className="text-lg leading-none">+</span>
            <span>New Sheet</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="text-sm text-stone-500">Loading sheets...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-red-500">Error: {error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-secondary mt-3 text-sm"
          >
            Retry
          </button>
        </div>
      ) : sheets.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="mb-3 text-4xl">📋</p>
          <h2
            className="mb-1 text-lg font-semibold text-stone-700"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            No sheets yet
          </h2>
          <p className="mb-4 text-sm text-stone-500">
            Create your first sewa sheet to get started
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="btn-primary"
          >
            + Create Sheet
          </button>
        </div>
      ) : filteredSheets.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="mb-3 text-4xl">🗓️</p>
          <h2
            className="mb-1 text-lg font-semibold text-stone-700"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            No sheets for this month
          </h2>
          <p className="text-sm text-stone-500">
            Try another month filter or create a new sheet for this month.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSheets.map((sheet) => (
            <SheetCard
              key={sheet._id}
              sheet={sheet}
              onDeleted={handleSheetDeleted}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateSheetModal
          onClose={() => setShowCreate(false)}
          onCreated={handleSheetCreated}
        />
      )}
    </div>
  );
}
