"use client";
import { useEffect, useState } from "react";
import RecordRow from "@/components/RecordRow";
import AutocompleteInput from "@/components/AutocompleteInput";
import AddPersonModal from "@/components/AddPersonModal";
import PrintSheetModal from "@/components/PrintSheetModal";
import { getFareAmount } from "@/lib/fare";

const COLUMNS = [
  "#",
  "Fare",
  "Remarks",
  "Name",
  "Father / Husband",
  "Age",
  "Gender",
  "Mobile",
  "Address",
  "Actions",
];

const COLUMN_WIDTHS = [
  "4%",
  "7%",
  "9%",
  "16%",
  "17%",
  "5%",
  "6%",
  "11%",
  "18%",
  "7%",
];

export default function SheetTable({
  sheet,
  sheetId,
  records,
  totalRecordsCount = records.length,
  onRecordsChange,
  onSheetUpdated,
  activeSearchRecordId,
  className = "",
}) {
  const [addRow, setAddRow] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [fare, setFare] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [printSheet, setPrintSheet] = useState(null);
  const [loadingPrintDetails, setLoadingPrintDetails] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState("");

  const isSamePersonAlreadyInSheet = (person) =>
    records.some((record) => record.personId?._id === person?._id);

  const resetAddRow = () => {
    setAddRow(false);
    setSelectedPerson(null);
    setFare("");
    setRemarks("");
    setError("");
    setDuplicateWarning("");
  };

  const handlePersonSelected = (person) => {
    setSelectedPerson(person);
    setError("");

    if (isSamePersonAlreadyInSheet(person)) {
      setDuplicateWarning(
        "This exact person is already added to this sheet. Same name is okay for different person IDs, but this selected person ID already exists here."
      );
      return;
    }

    setDuplicateWarning("");
  };

  const handleNotFound = (name) => {
    setNewPersonName(name);
    setShowAddPerson(true);
  };

  const handlePersonAdded = async (person) => {
    setShowAddPerson(false);
    setSelectedPerson(person);
    setDuplicateWarning("");
    await addRecordForPerson(person);
  };

  const addRecordForPerson = async (person, allowDuplicate = false) => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId,
          personId: person._id,
          fare,
          remarks: remarks || "",
          allowDuplicate,
        }),
      });
      const data = await res.json();

      if (data.success) {
        onRecordsChange((prev) => [...prev, data.data]);
        resetAddRow();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to add record.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRecord = async () => {
    if (!selectedPerson) {
      setError("Please select a person first.");
      return;
    }

    await addRecordForPerson(
      selectedPerson,
      isSamePersonAlreadyInSheet(selectedPerson)
    );
  };

  const handleUpdated = (updatedRecord) => {
    onRecordsChange((prev) =>
      prev.map((r) => (r._id === updatedRecord._id ? updatedRecord : r))
    );
  };

  const handleDeleted = (recordId) => {
    onRecordsChange((prev) => prev.filter((r) => r._id !== recordId));
  };

  const handlePrintClick = async () => {
    setLoadingPrintDetails(true);
    try {
      const res = await fetch(`/api/sheets/${sheetId}`);
      const data = await res.json();

      if (data.success) {
        const latestSheet = data.data;
        setPrintSheet(latestSheet);
        onSheetUpdated?.(latestSheet);
      } else {
        setPrintSheet(sheet);
      }
    } catch {
      setPrintSheet(sheet);
    } finally {
      setLoadingPrintDetails(false);
      setShowPrint(true);
    }
  };

  useEffect(() => {
    if (!activeSearchRecordId) return;

    const row = document.getElementById(`record-${activeSearchRecordId}`);
    row?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [activeSearchRecordId, records]);

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      {!addRow && (
        <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            id="add-person-btn"
            onClick={() => setAddRow(true)}
            className="btn-primary w-full text-sm sm:w-auto"
          >
            + Add Person to Sheet
          </button>
          <button
            type="button"
            onClick={handlePrintClick}
            disabled={loadingPrintDetails}
            className="btn-secondary w-full text-sm sm:w-auto"
          >
            {loadingPrintDetails ? "Loading..." : "Print"}
          </button>
        </div>
      )}

      {addRow && (
        <div className="card mb-4 shrink-0 p-4">
          <h3
            className="mb-3 text-sm font-semibold text-stone-700"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Add Person to Sheet
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Search by Name
              </label>
              <AutocompleteInput
                onPersonSelected={handlePersonSelected}
                onNotFound={handleNotFound}
              />
              {selectedPerson && (
                <p className="mt-1 text-xs text-green-600">
                  {selectedPerson.name} selected
                </p>
              )}
              {duplicateWarning && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {duplicateWarning}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Fare
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Amount or N/A"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                Remarks
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Optional note"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-500">
              {error}
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleAddRecord}
              disabled={saving || !selectedPerson}
              className="btn-primary text-sm sm:w-auto"
            >
              {saving
                ? "Adding..."
                : duplicateWarning
                  ? "Add Again Anyway"
                  : "Add to Sheet"}
            </button>
            <button
              onClick={resetAddRow}
              className="btn-secondary text-sm sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="card min-h-0 flex-1 overflow-y-auto p-10 text-center text-stone-400">
          <p className="mb-2 text-3xl">No Data</p>
          <p className="text-sm">
            {totalRecordsCount === 0
              ? "No records yet. Add a person to get started."
              : "No records match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="border-b border-stone-100 px-4 py-2 text-xs text-stone-500 sm:hidden">
            Swipe sideways to view all columns
          </div>
          <div className="table-scroll min-h-0 flex-1 overflow-y-auto">
            <table className="min-w-[960px] w-full table-fixed border-collapse text-left">
              <colgroup>
                {COLUMN_WIDTHS.map((width, index) => (
                  <col key={index} style={{ width }} />
                ))}
              </colgroup>
              <thead className="sticky top-0 z-10">
                <tr className="bg-stone-50">
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="whitespace-nowrap border border-stone-300 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-stone-500"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record, i) => (
                  <RecordRow
                    key={record._id}
                    record={record}
                    index={i + 1}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                    isSearchMatch={record._id === activeSearchRecordId}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex shrink-0 flex-col gap-1 border-t border-stone-100 bg-stone-50 px-4 py-3 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {records.length} person{records.length !== 1 ? "s" : ""}
            </span>
            <span className="font-medium text-stone-700">
              Total Fare: Rs.
              {records.reduce((sum, r) => sum + getFareAmount(r.fare), 0)}
            </span>
          </div>
        </div>
      )}

      {showAddPerson && (
        <AddPersonModal
          initialName={newPersonName}
          onClose={() => setShowAddPerson(false)}
          onAdded={handlePersonAdded}
        />
      )}

      {showPrint && (
        <PrintSheetModal
          key={`${(printSheet || sheet)?._id}-${(printSheet || sheet)?.updatedAt || ""}`}
          sheet={printSheet || sheet}
          onClose={() => setShowPrint(false)}
          onSaved={(updatedSheet) => {
            setPrintSheet(updatedSheet);
            onSheetUpdated?.(updatedSheet);
          }}
        />
      )}
    </div>
  );
}
