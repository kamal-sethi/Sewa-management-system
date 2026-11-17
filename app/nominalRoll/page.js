"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function getMonthKey(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getCurrentMonthKey() {
  const date = new Date();
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

function formatSheetDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NominalRollPage() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  useEffect(() => {
    let active = true;

    async function loadNominalRolls() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/sheets");
        const data = await res.json();

        if (!active) return;

        if (data.success) {
          const allSheets = Array.isArray(data.data) ? data.data : [];
          // Filter sheets that have nominal roll configured
          const rolls = allSheets.filter(
            (sheet) =>
              sheet.hasNominalRoll ||
              Boolean(sheet.nominalRollId) ||
              Boolean(sheet.jathedarName)
          );
          setSheets(rolls);
          return;
        }

        throw new Error(data.message || "Failed to load nominal rolls.");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadNominalRolls();

    return () => {
      active = false;
    };
  }, []);

  const currentMonthKey = getCurrentMonthKey();
  const monthOptions = Array.from(
    new Set([
      currentMonthKey,
      ...sheets.map((sheet) => getMonthKey(sheet.createdAt)).filter(Boolean),
    ])
  ).sort((a, b) => b.localeCompare(a));

  const filteredRolls = sheets.filter((sheet) => {
    if (selectedMonth === "all") return true;
    return getMonthKey(sheet.createdAt) === selectedMonth;
  });

  return (
    <div>
      {/* Header with Month Filter */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-stone-800"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Nominal Rolls
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {filteredRolls.length} nominal roll
            {filteredRolls.length !== 1 ? "s" : ""} shown
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
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                  {month === currentMonthKey ? " (Current)" : ""}
                </option>
              ))}
              <option value="all">All months</option>
            </select>
          </div>

          <Link
            href="/sheets"
            className="btn-primary flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+ Open Sheets</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="text-sm text-stone-500">Loading nominal rolls...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-red-500">Error: {error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-secondary mt-3 text-sm cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : sheets.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="mb-3 text-4xl">📄</p>
          <h2
            className="mb-1 text-lg font-semibold text-stone-700"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            No nominal rolls generated yet
          </h2>
          <p className="mx-auto mb-4 max-w-md text-sm text-stone-500">
            Open any sheet, add sewadar names, and click the <strong>Print</strong> button to fill details and continue. The nominal roll will automatically appear here.
          </p>
          <Link href="/sheets" className="btn-primary inline-flex cursor-pointer">
            Go to Sheets
          </Link>
        </div>
      ) : filteredRolls.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="mb-3 text-4xl">🗓️</p>
          <h2
            className="mb-1 text-lg font-semibold text-stone-700"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            No nominal rolls for this month
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Try choosing another month or create a nominal roll from your current sheets.
          </p>
          <Link href="/sheets" className="btn-primary inline-flex cursor-pointer">
            View Current Sheets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRolls.map((sheet) => {
            const extraLinesParam = sheet.extraLines ? `?extraLines=${sheet.extraLines}` : "";
            const formattedDate = formatSheetDate(sheet.createdAt);

            return (
              <div
                key={sheet._id}
                className="group relative flex flex-col justify-between gap-3.5 rounded-xl border border-stone-200/90 bg-white p-4 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-100 bg-orange-50 text-orange-600">
                    <svg
                      className="h-5 w-5"
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

                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-base font-semibold text-stone-800 break-words leading-snug"
                      style={{ fontFamily: "'Baloo 2', cursive" }}
                      title={sheet.name}
                    >
                      {sheet.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Sheet Date: {formattedDate || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Details Body */}
                <div className="flex flex-col gap-2 rounded-lg bg-stone-50 p-2.5 text-xs text-stone-600">
                  {sheet.jathedarName && (
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="text-stone-400 shrink-0">👤 Jathedar:</span>
                      <span className="font-medium text-stone-700 break-words leading-snug">
                        {sheet.jathedarName}
                        {sheet.jathedarMobileNumber ? ` (${sheet.jathedarMobileNumber})` : ""}
                      </span>
                    </div>
                  )}

                  {sheet.sewaName && (
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="text-stone-400 shrink-0">📍 Sewa:</span>
                      <span className="font-medium text-stone-700 break-words leading-snug">
                        {sheet.sewaName}
                      </span>
                    </div>
                  )}

                  {sheet.sewaDuration && (
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="text-stone-400 shrink-0">⏱️ Duration:</span>
                      <span className="font-medium text-stone-700 break-words leading-snug">
                        {sheet.sewaDuration}
                      </span>
                    </div>
                  )}

                  {sheet.vehicleType && (
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="text-stone-400 shrink-0">🚌 Vehicle:</span>
                      <span className="font-medium text-stone-700 break-words leading-snug">
                        {sheet.vehicleType} {sheet.busNumber ? `(${sheet.busNumber})` : ""}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-stone-400 shrink-0">👥 Sewadars:</span>
                    <span className="font-semibold text-stone-800">
                      {sheet.recordsCount ?? 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-stone-100 pt-2.5">
                  <Link
                    href={`/nominalRoll/${sheet._id}${extraLinesParam}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
                  >
                    View Nominal Roll →
                  </Link>

                  <Link
                    href={`/sheets/${sheet._id}`}
                    className="text-xs text-stone-400 hover:text-stone-700 hover:underline cursor-pointer"
                  >
                    Source Sheet
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
