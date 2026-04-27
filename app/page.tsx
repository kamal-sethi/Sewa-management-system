"use client";

import { useState, useEffect, useCallback } from "react";
import SheetCard from "@/components/SheetCard";
import CreateSheetModal from "@/components/CreateSheetModal";

type Sheet = {
  _id: string;
  // add more fields if needed later
};

export default function HomePage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState<boolean>(false);

  const fetchSheets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sheets");
      const data = await res.json();

      if (data.success) setSheets(data.data);
      else throw new Error(data.message);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const handleSheetCreated = (newSheet: Sheet) => {
    setSheets((prev) => [newSheet, ...prev]);
    setShowCreate(false);
  };

  const handleSheetDeleted = (id: string) => {
    setSheets((prev) => prev.filter((s) => s._id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-stone-800"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Sewa Sheets
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {sheets.length} sheet{sheets.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          <span className="hidden sm:inline">New Sheet</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500 text-sm">Loading sheets...</p>
          </div>
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-red-500">⚠️ {error}</p>
          <button onClick={fetchSheets} className="btn-secondary mt-3 text-sm">
            Retry
          </button>
        </div>
      ) : sheets.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <h2
            className="text-lg font-semibold text-stone-700 mb-1"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            No sheets yet
          </h2>
          <p className="text-stone-500 text-sm mb-4">
            Create your first sewa sheet to get started
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + Create Sheet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((sheet) => (
            <SheetCard
              key={sheet._id}
              sheet={sheet}
              onDeleted={handleSheetDeleted}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateSheetModal
          onClose={() => setShowCreate(false)}
          onCreated={handleSheetCreated}
        />
      )}
    </div>
  );
}
