"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-stone-800"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Sewa Dashboard
        </h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Choose what you want to manage
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Link
          href="/nominalRoll"
          className="card block p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
            <span>📄</span>
          </div>
          <h2
            className="text-xl font-semibold text-stone-800"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Nominal Rolls
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Open nominal rolls and manage their records in a separate page.
          </p>
        </Link>

        <Link
          href="/sheets"
          className="card block p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-2xl">
            <span>📋</span>
          </div>
          <h2
            className="text-xl font-semibold text-stone-800"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Sheets
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Open all sewa sheets and filter them by month on a dedicated page.
          </p>
        </Link>
      </div>
    </div>
  );
}
