// app/sheets/[id]/page.js
"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SheetTable from "@/components/SheetTable";
import EditSheetModal from "@/components/EditSheetModal";
import { getFareAmount, isFareEmpty, isFareNA } from "@/lib/fare";

const FILTERS = [
  { id: "all", label: "All Records" },
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "child", label: "Child (<14)" },
  { id: "fareEmpty", label: "Fare Empty" },
  { id: "fareNA", label: "Fare N/A" },
  { id: "already", label: "Already" },
];

export default function SheetDetailPage() {
  const { id } = useParams();

  const [sheet, setSheet] = useState(null);
  const [records, setRecords] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [findMessage, setFindMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const findInputRef = useRef(null);

  useEffect(() => {
    const fetchSheet = async () => {
      try {
        const res = await fetch(`/api/sheets?id=${encodeURIComponent(id)}`);
        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(`Sheet API returned ${res.status} instead of JSON.`);
        }

        const data = await res.json();
        if (data.success) {
          setSheet(data.data);
          setRecords(data.data.records || []);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSheet();
  }, [id]);

  const handleSheetUpdated = (updated) => {
    setSheet((prev) => ({ ...prev, ...updated }));
    setShowEdit(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const tagName = target?.tagName?.toLowerCase();
      const isEditable =
        target?.isContentEditable ||
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select";

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setFindOpen(true);
        setFindMessage("");
        window.setTimeout(() => findInputRef.current?.select(), 0);
        return;
      }

      if (event.key === "Escape" && findOpen && !isEditable) {
        setFindOpen(false);
        setActiveMatchId(null);
        setFindMessage("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [findOpen]);

  useEffect(() => {
    if (findOpen) {
      findInputRef.current?.focus();
      findInputRef.current?.select();
    }
  }, [findOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 text-sm">Loading sheet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <Link href="/" className="btn-secondary inline-block">
          Back to Sheets
        </Link>
      </div>
    );
  }

  const filterRecords = (recordList, filterId) =>
    recordList.filter((record) => {
      const gender = record.personId?.gender;
      const age = Number(record.personId?.age);
      const remarks = String(record.remarks || "")
        .trim()
        .toLowerCase();

      switch (filterId) {
        case "male":
          return gender === "Male";
        case "female":
          return gender === "Female";
        case "child":
          return Number.isFinite(age) && age < 14;
        case "fareEmpty":
          return isFareEmpty(record.fare);
        case "fareNA":
          return isFareNA(record.fare);
        case "already":
          return remarks === "already" || remarks === "already in beas";
        default:
          return true;
      }
    });

  const getSearchText = (record) =>
    `${record.personId?.name || ""} ${
      record.personId?.fatherOrHusbandName || ""
    }`.toLowerCase();

  const findMatches = (recordList, query) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return recordList.filter((record) =>
      getSearchText(record).includes(normalizedQuery),
    );
  };

  const filteredRecords = filterRecords(records, activeFilter);

  const goToMatch = (direction = 1) => {
    const query = findQuery.trim();
    if (!query) {
      setActiveMatchId(null);
      setFindMessage("");
      return;
    }

    let visibleMatches = findMatches(filteredRecords, query);
    let searchRecords = filteredRecords;

    if (visibleMatches.length === 0 && activeFilter !== "all") {
      const allMatches = findMatches(records, query);
      if (allMatches.length > 0) {
        setActiveFilter("all");
        visibleMatches = allMatches;
        searchRecords = records;
      }
    }

    if (visibleMatches.length === 0) {
      setActiveMatchId(null);
      setFindMessage("No record");
      return;
    }

    const currentIndex = visibleMatches.findIndex(
      (record) => record._id === activeMatchId,
    );
    const nextIndex =
      currentIndex === -1
        ? direction > 0
          ? 0
          : visibleMatches.length - 1
        : (currentIndex + direction + visibleMatches.length) %
          visibleMatches.length;
    const nextRecord = visibleMatches[nextIndex];
    const rowNumber =
      searchRecords.findIndex((record) => record._id === nextRecord._id) + 1;

    setActiveMatchId(nextRecord._id);
    setFindMessage(
      `${nextIndex + 1} of ${visibleMatches.length}, row ${rowNumber}`,
    );
  };

  const handleFindSubmit = (event) => {
    event.preventDefault();
    goToMatch(event.shiftKey ? -1 : 1);
  };

  const totalFare = filteredRecords.reduce(
    (sum, record) => sum + getFareAmount(record.fare),
    0,
  );
  const maleCount = filteredRecords.filter(
    (record) => record.personId?.gender === "Male",
  ).length;
  const femaleCount = filteredRecords.filter(
    (record) => record.personId?.gender === "Female",
  ).length;
  const childCount = filteredRecords.filter(
    (record) => Number(record.personId?.age) < 14,
  ).length;

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col overflow-hidden">
      <div className="mb-4 flex shrink-0 items-center gap-2 text-sm text-stone-500">
        <Link href="/" className="hover:text-orange-600 transition-colors">
          All Sheets
        </Link>
        <span>/</span>
        <span className="text-stone-700 font-medium truncate">
          {sheet.name}
        </span>
      </div>

      <div className="mb-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-5">
          <div>
            <p className="text-xs text-stone-500">Total</p>
            <p
              className="text-lg font-bold text-stone-800"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {filteredRecords.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Children (&lt;14)</p>
            <p
              className="text-lg font-bold text-orange-600"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {childCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Fare</p>
            <p
              className="text-lg font-bold text-green-600"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              ₹{totalFare}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-500">M / F</p>
            <p
              className="text-lg font-bold text-stone-800"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {maleCount} / {femaleCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* <button
            onClick={() => document.getElementById("add-person-btn")?.click()}
            className="btn-primary text-sm"
          >
            + Add Person
          </button> */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="input-field text-sm"
          >
            {FILTERS.map((filter) => (
              <option key={filter.id} value={filter.id}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {findOpen && (
        <form
          onSubmit={handleFindSubmit}
          className="sticky top-3 z-30 ml-auto mb-4 flex w-full max-w-xl shrink-0 items-center gap-2 rounded-lg border border-stone-300 bg-white p-2 shadow-lg"
        >
          <label
            htmlFor="sheet-find"
            className="text-sm font-semibold text-stone-700"
          >
            Find
          </label>
          <input
            id="sheet-find"
            ref={findInputRef}
            type="search"
            className="input-field h-9 flex-1 py-1"
            value={findQuery}
            onChange={(event) => {
              setFindQuery(event.target.value);
              setFindMessage("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setFindOpen(false);
                setActiveMatchId(null);
                setFindMessage("");
              }
            }}
            placeholder="Name or father name"
          />
          <button type="submit" className="btn-primary h-9 px-3 text-sm">
            Find
          </button>
          <button
            type="button"
            className="btn-secondary h-9 px-3 text-sm"
            onClick={() => goToMatch(-1)}
          >
            Prev
          </button>
          <span className="min-w-20 text-xs font-medium text-stone-500">
            {findMessage}
          </span>
          <button
            type="button"
            className="h-9 w-9 rounded-lg border border-stone-300 text-stone-500 transition hover:bg-stone-100"
            onClick={() => {
              setFindOpen(false);
              setActiveMatchId(null);
              setFindMessage("");
            }}
            aria-label="Close find"
          >
            x
          </button>
        </form>
      )}

      <SheetTable
        sheet={sheet}
        sheetId={id}
        records={filteredRecords}
        totalRecordsCount={records.length}
        onRecordsChange={setRecords}
        onSheetUpdated={handleSheetUpdated}
        activeSearchRecordId={activeMatchId}
        className="min-h-0 flex-1"
      />

      {showEdit && (
        <EditSheetModal
          sheet={sheet}
          onClose={() => setShowEdit(false)}
          onUpdated={handleSheetUpdated}
        />
      )}
    </div>
  );
}
