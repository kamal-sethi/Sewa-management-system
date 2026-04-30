"use client";

// SewaJathaNominalRoll.jsx
// A print-friendly React component for Satsang Centres in India - Nominal Roll Sewa Jatha
// Usage: import and pass `data` prop (see defaultData below for shape)

import React, { useState } from "react";

const UNSUPPORTED_COLOR_FUNCTIONS = ["lab(", "lch(", "oklab(", "oklch("];

const hasUnsupportedColorFunction = (value = "") =>
  UNSUPPORTED_COLOR_FUNCTIONS.some((fn) => value.includes(fn));

function sanitizeCloneColors(cloneDocument) {
  const elements = [
    cloneDocument.documentElement,
    cloneDocument.body,
    ...cloneDocument.querySelectorAll("*"),
  ];

  for (const element of elements) {
    const computed = cloneDocument.defaultView?.getComputedStyle(element);

    if (!computed) {
      continue;
    }

    const color = computed.color || "";
    const backgroundColor = computed.backgroundColor || "";
    const borderTopColor = computed.borderTopColor || "";
    const borderRightColor = computed.borderRightColor || "";
    const borderBottomColor = computed.borderBottomColor || "";
    const borderLeftColor = computed.borderLeftColor || "";
    const outlineColor = computed.outlineColor || "";
    const textDecorationColor = computed.textDecorationColor || "";
    const boxShadow = computed.boxShadow || "";

    if (hasUnsupportedColorFunction(color)) {
      element.style.setProperty("color", "#000", "important");
    }

    if (hasUnsupportedColorFunction(backgroundColor)) {
      const fallbackBackground =
        element === cloneDocument.documentElement ||
        element === cloneDocument.body ||
        element.id === "print-content" ||
        element.classList.contains("njr-page")
          ? "#fff"
          : "transparent";

      element.style.setProperty(
        "background-color",
        fallbackBackground,
        "important",
      );
    }

    if (hasUnsupportedColorFunction(borderTopColor)) {
      element.style.setProperty("border-top-color", "#222", "important");
    }
    if (hasUnsupportedColorFunction(borderRightColor)) {
      element.style.setProperty("border-right-color", "#222", "important");
    }
    if (hasUnsupportedColorFunction(borderBottomColor)) {
      element.style.setProperty("border-bottom-color", "#222", "important");
    }
    if (hasUnsupportedColorFunction(borderLeftColor)) {
      element.style.setProperty("border-left-color", "#222", "important");
    }
    if (hasUnsupportedColorFunction(outlineColor)) {
      element.style.setProperty("outline-color", "#222", "important");
    }
    if (hasUnsupportedColorFunction(textDecorationColor)) {
      element.style.setProperty("text-decoration-color", "#000", "important");
    }
    if (hasUnsupportedColorFunction(boxShadow)) {
      element.style.setProperty("box-shadow", "none", "important");
    }
  }
}

const sanitizeFilename = (value = "document") =>
  String(value)
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120) || "document";

function preparePdfClone(cloneDocument) {
  sanitizeCloneColors(cloneDocument);

  const root = cloneDocument.documentElement;
  const body = cloneDocument.body;
  const printContent = cloneDocument.getElementById("print-content");

  root.style.setProperty("background", "#ffffff", "important");
  body.style.setProperty("background", "#ffffff", "important");
  body.style.setProperty("margin", "0", "important");
  body.style.setProperty("padding", "0", "important");
  body.style.setProperty("width", "210mm", "important");
  body.style.setProperty("min-width", "210mm", "important");
  body.style.setProperty("overflow", "hidden", "important");

  if (!printContent) {
    return;
  }

  printContent.classList.add("njr-pdf-mode");
  printContent.style.setProperty("width", "210mm", "important");
  printContent.style.setProperty("min-width", "210mm", "important");
  printContent.style.setProperty("max-width", "210mm", "important");
  printContent.style.setProperty("margin", "0", "important");
  printContent.style.setProperty("padding", "2mm 4mm 8mm", "important");
  printContent.style.setProperty("box-shadow", "none", "important");
  printContent.style.setProperty("min-height", "0", "important");

  const logoInner = printContent.querySelector(".njr-logo-inner");
  if (logoInner) {
    logoInner.style.setProperty("justify-content", "center", "important");
    logoInner.style.setProperty("padding-top", "0", "important");
    logoInner.style.setProperty("line-height", "0.95", "important");
  }
}

async function generatePdfFromElement(element, filename) {
  const { default: html2pdf } = await import("html2pdf.js");

  await html2pdf()
    .set({
      margin: [1, 0, 0, 0],
      filename: `${sanitizeFilename(filename)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 1600,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (cloneDocument) => {
          preparePdfClone(cloneDocument);
        },
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: {
        mode: ["css"],
        avoid: [".njr-no-break", ".section-row"],
      },
    })
    .from(element)
    .save();
}

// ─── Inline styles ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap');

  .njr-root {
    box-sizing: border-box;
  }

  .njr-root * {
    font-family: 'Times New Roman', Times, serif;
    box-sizing: border-box;
  }

  .njr-page {
    background: white;
    width: min(210mm, 100%);
    min-height: 0;
    margin: 0 auto;
    padding: 4mm 6mm 10mm;
    box-shadow: 0 4px 32px rgba(0,0,0,0.18);
    position: relative;
    font-size: 11.5px;
  }

  .njr-top-right-id {
    position: absolute;
    top: 1.5mm;
    right: 4mm;
    font-size: 12px;
    font-weight: normal;
    text-align: right;
  }

  .njr-pdf-mode {
    width: 210mm !important;
    min-width: 210mm !important;
    max-width: 210mm !important;
    padding: 2mm 4mm 8mm !important;
    box-shadow: none !important;
    min-height: 0 !important;
  }

  .njr-actions {
    display: flex;
    justify-content: flex-end;
    width: 210mm;
    max-width: 100%;
    margin: 0 auto 16px;
  }

  .njr-download-btn {
    border: 1px solid #d6d3d1;
    background: #fff;
    color: #292524;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .njr-download-btn:hover:not(:disabled) {
    background: #f5f5f4;
    border-color: #a8a29e;
  }

  .njr-download-btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .njr-logo-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-bottom: 4px;
    flex-wrap: nowrap;
  }

  .njr-logo-box {
    border: 2px solid #222;
    width: 46px;
    height: 52px;
    padding: 2px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .njr-logo-inner {
    width: 100%;
    height: 100%;
    background: #111;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    line-height: 0.95;
    padding-top: 0;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .njr-header-title {
    text-align: center;
    flex: 1;
  }
  .njr-header-title h1 {
    font-size: 17px;
    font-variant: small-caps;
    font-weight: bold;
    letter-spacing: 0.06em;
    margin: 0;
    line-height: 1.05;
  }
  .njr-header-title h2 {
    font-size: 15px;
    font-variant: small-caps;
    font-weight: bold;
    letter-spacing: 0.04em;
    margin: 0;
    line-height: 1.05;
  }
  .njr-header-id {
    font-size: 12px;
    font-weight: bold;
    margin-top: 3px;
  }

  .njr-reg-block {
    text-align: center;
    margin: 8px 0 10px 0;
    font-size: 11.5px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .njr-meta-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-size: 11.5px;
    margin-bottom: 3px;
    gap: 4px 16px;
  }
  .njr-meta-row .njr-val {
    font-weight: bold;
    text-decoration: none;
  }
  .njr-meta-row--top .njr-val {
    text-decoration: underline;
  }
  .njr-meta-pair {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    min-width: 0;
  }
  .njr-meta-label {
    display: inline-block;
    min-width: 132px;
  }
  .njr-meta-pair .njr-val {
    min-width: 0;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .njr-name-line {
    white-space: nowrap;
  }
  .njr-meta-row--top {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.45fr);
    gap: 4px 12px;
  }

  @media print {
    body { background: white !important; padding: 0 !important; margin: 0 !important; }
    .njr-actions { display: none !important; }
    .njr-top-right-id {
      top: 1mm !important;
      right: 4mm !important;
    }
    .njr-logo-inner {
      background: #111 !important;
      color: #fff !important;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .njr-page {
      box-shadow: none !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 2mm 4mm 8mm !important;
      min-height: 0 !important;
    }
    .njr-meta-row {
      grid-template-columns: 1fr 1fr !important;
      gap: 4px 16px !important;
    }
    .njr-meta-row--top {
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.45fr) !important;
      gap: 4px 12px !important;
    }
    .njr-meta-pair {
      display: inline-flex !important;
      align-items: baseline !important;
    }
    .njr-meta-label {
      min-width: 132px !important;
    }
  }

  @media (max-width: 720px) {
    .njr-meta-row {
      grid-template-columns: 1fr;
    }
  }

  .njr-mention {
    font-size: 11px;
    font-style: normal;
    font-weight: 550;
    margin: 4px 0 8px 0;
  }

  .njr-table {
    width: calc(100% + 4mm);
    margin-left: -2mm;
    margin-right: -2mm;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 11.5px;
    margin-top: 4px;
  }
  .njr-table thead {
    display: table-header-group;
  }
  .njr-table tbody {
    display: table-row-group;
  }
  .njr-table th, .njr-table td {
    border: 1.2px solid #111;
    padding: 5px 6px;
    vertical-align: middle;
  }
  .njr-table tr,
  .njr-no-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .njr-table th {
    font-weight: 700;
    background: white;
    text-align: left;
    vertical-align: top;
    text-transform: uppercase;
  }
  .njr-table th.center, .njr-table td.center {
    text-align: center;
  }
  .njr-table th.sno {
    font-weight: 600;
  }
  .njr-table td.sno-cell {
    font-weight: 600;
  }
  .njr-table th.sno { width: 6%; text-align: center; }
  .njr-table th.name-col { width: 21%; }
  .njr-table th.father-col { width: 22%; }
  .njr-table th.gender { width: 9%; }
  .njr-table th.age { width: 6%; }
  .njr-table th.address-col { width: 23%; }
  .njr-table th.mobile-col { width: 13%; }
  .njr-table th.gender,
  .njr-table th.age,
  .njr-table th.mobile-col {
    white-space: nowrap;
    word-break: normal;
    overflow-wrap: normal;
  }
  .njr-table td.name-cell,
  .njr-table td.father-cell,
  .njr-table td.address-cell {
    font-size: 12px;
    font-weight: normal;
    line-height: 1.25;
    text-transform: uppercase;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    vertical-align: top;
  }
  .njr-table td.name-cell.njr-jathedar-name {
    font-weight: bold;
  }
  .njr-table td,
  .njr-table th {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .njr-table td.mobile-cell {
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    font-size: 11px;
    line-height: 1.2;
    text-align: center;
  }
  .njr-table tr.section-row td {
    font-weight: bold;
    text-transform: uppercase;
    background: white;
  }
  .njr-table td.section-label {
    text-align: center;
    letter-spacing: 0.04em;
  }

  .njr-summary {
    margin-top: 10px;
    font-size: 12px;
    font-weight: bold;
  }
  .njr-note {
    font-size: 11px;
    font-weight: normal;
    margin-top: 3px;
  }

  .njr-func-sig {
    display: flex;
    justify-content: flex-end;
    margin-top: 48px;
    margin-bottom: -8px;
    font-size: 11px;
  }
  .njr-func-sig-inner {
    text-align: center;
    font-style: italic;
  }

  .njr-footer {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-top: 56px;
    font-size: 11px;
    gap: 12px;
  }
  .njr-footer-left .njr-sig-block {
    display: inline-block;
    border-top: 1.5px solid #222;
    padding-top: 3px;
    line-height: 2;
  }
  .njr-footer-right {
    text-align: right;
    min-width: 0;
  }
  .njr-footer-right .njr-sig-block {
    display: inline-block;
    border-top: 1.5px solid #222;
    padding-top: 3px;
    line-height: 2;
    max-width: 100%;
    text-align: left;
  }

`;

// ─── Default Data ─────────────────────────────────────────────────────────────
const defaultData = {
  sciRef: "SCI/2020/84",
  registrations: [
    { label: "RAJPURA", code: "PTA/PB/152/001/2026326/4" },
    { label: "GHANAUR", code: "PTA/PB/152/005/2026326/1" },
    { label: "PATIALA -I", code: "PTA/PB/152/003/2026326/5" },
  ],
  satsangPlace: "RAJPURA",
  area: "PATIALA-A",
  zone: "III",
  jathedar: "SH. GURPREET SINGH",
  driver: "SELF DRIVEN",
  vehicleType: "JEEP",
  vehicleNo: "",
  placeOfSewa: "SEWA SAMITI - COMPUTER SEWA, BEAS",
  sewaFrom: "27/03/2026",
  sewaTo: "29/03/2026",
  sewadars: [
    { name: "GURPREET SINGH",  fatherHusband: "LAKHMINDER SINGH", gender: "MALE",   age: 24, mobileNumber: "9876543209", address: "GHANAUR"     },
    { name: "BHART",           fatherHusband: "HARBANS LAL",      gender: "MALE",   age: 26, mobileNumber: "9876543210", address: "PATIALA - I" },
    { name: "BHANU PARKASH",   fatherHusband: "GOVIND CHAND",     gender: "MALE",   age: 35, mobileNumber: "9876543211", address: "PATIALA - I" },
    { name: "KAMAL SETHI",     fatherHusband: "MOHINDER KUMAR",   gender: "MALE",   age: 24, mobileNumber: "9876543212", address: "RAJPURA"     },
    { name: "HARDIK KATHURIA", fatherHusband: "SANJAY KATHURIA",  gender: "MALE",   age: 23, mobileNumber: "9876543213", address: "RAJPURA"     },
    { name: "PRIYANKA KAUSHAL",fatherHusband: "LEKH RAJ",         gender: "FEMALE", age: 24, mobileNumber: "9876543214", address: "RAJPURA"     },
    { name: "GUNJAN UTREJA",   fatherHusband: "VINOD KUMAR",      gender: "FEMALE", age: 25, mobileNumber: "9876543215", address: "RAJPURA"     },
    { name: "DEEPANSHI",       fatherHusband: "PREM KUMAR",       gender: "FEMALE", age: 28, mobileNumber: "9876543216", address: "RAJPURA"     },
  ],
  signatureNote: "1) THE IDENTITY, AGE AND PHYSICAL FITNESS OF MECH. SEWADAR IS HEREBY CONFIRMED.",
  functionary: {
    name: "LALIT JINDAL",
    title: "Secretary, RSS(B), RAJPURA",
  },
  jathedarSignature: {
    date: "26/03/2026",
    contact: "7696094880",
  },
  functionarySignature: {
    date: "26/03/2026",
    contact: "9988160787",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SewaJathaNominalRoll({ data = defaultData }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const extraEmptyRows = Math.max(0, Number(data.extraEmptyRows) || 0);
  const splitMultiValue = (value = "") =>
    value
      .split(/\s*(?:,|&|\/|\n)\s*/)
      .map((item) => item.trim())
      .filter(Boolean);

  const normalizeName = (value = "") =>
    String(value)
      .toUpperCase()
      .replace(/\b(SHRI|SH\.|SH|SMT\.|SMT|SARDAR|SARDARNI|MISS|MRS\.|MRS|MS\.)\b/g, "")
      .replace(/[^A-Z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const jathedarNames = splitMultiValue(data.jathedar).map(normalizeName);
  const isFemaleJathedar = /\bSMT\.?\b/i.test(data.jathedar || "");
  const matchedJathedarKeys = new Set();
  const usedSewadarKeys = new Set();

  jathedarNames
    .filter(Boolean)
    .forEach((jathedarName) => {
      const matchedSewadar = data.sewadars.find((sewadar, index) => {
        const sewadarKey =
          sewadar.recordId ||
          sewadar.personId ||
          `${normalizeName(sewadar?.name)}-${index}`;

        if (usedSewadarKeys.has(sewadarKey)) {
          return false;
        }

        return normalizeName(sewadar?.name) === jathedarName;
      });

      if (!matchedSewadar) {
        return;
      }

      const matchedKey =
        matchedSewadar.recordId ||
        matchedSewadar.personId ||
        normalizeName(matchedSewadar?.name);

      usedSewadarKeys.add(matchedKey);
      matchedJathedarKeys.add(matchedKey);
    });

  const compareAlphabetically = (left, right) =>
    normalizeName(left?.name).localeCompare(normalizeName(right?.name), "en", {
      sensitivity: "base",
    });

  const getSewadarKey = (sewadar) =>
    sewadar?.recordId || sewadar?.personId || normalizeName(sewadar?.name);

  const isJathedar = (sewadar) => matchedJathedarKeys.has(getSewadarKey(sewadar));

  const sortSewadars = (sewadars) =>
    [...sewadars].sort((left, right) => {
      const leftIsJathedar = isJathedar(left);
      const rightIsJathedar = isJathedar(right);

      if (leftIsJathedar !== rightIsJathedar) {
        return leftIsJathedar ? -1 : 1;
      }

      return compareAlphabetically(left, right);
    });

  const renderNamesOnSeparateLines = (value = "") => {
    const parts = splitMultiValue(value);

    if (parts.length === 0) {
      return "";
    }

    return parts.map((part, index) => {
      const formattedPart = part
        .trim()
        .replace(/\s+/g, " ")
        .replace(
          /\b(SMT\.?|SHRI|SH\.?|SARDARNI|SARDAR)\s+/gi,
          (match) => match.trimEnd() + "\u00A0",
        )
        .replace(/ /g, "\u00A0");

      return (
        <React.Fragment key={`${part}-${index}`}>
          {index > 0 && <br />}
          <span className="njr-name-line">{formattedPart}</span>
        </React.Fragment>
      );
    });
  };

  const renderVehicleNumbers = (value = "") => {
    const parts = splitMultiValue(value);
    return parts.length > 0 ? parts.join(" & ") : "";
  };

  const toUppercaseText = (value = "") => String(value || "").toUpperCase();
  const normalizeGender = (value = "") => String(value || "").trim().toUpperCase();

  const isChild = (sewadar) => {
    const age = Number(sewadar.age);
    return Number.isFinite(age) && age < 14;
  };

  const maleSewadars = sortSewadars(
    data.sewadars.filter(
      (sewadar) => !isChild(sewadar) && normalizeGender(sewadar.gender) === "MALE",
    ),
  );
  const femaleSewadars = sortSewadars(
    data.sewadars.filter(
      (sewadar) =>
        !isChild(sewadar) && normalizeGender(sewadar.gender) === "FEMALE",
    ),
  );
  const childSewadars = [...data.sewadars.filter(isChild)].sort(compareAlphabetically);
  const automaticChildSpacingRows = childSewadars.length > 0 ? 2 : 0;
  const displayRows = [
    ...maleSewadars.map((sewadar) => ({ type: "person", sewadar })),
    ...femaleSewadars.map((sewadar) => ({ type: "person", sewadar })),
    ...(childSewadars.length > 0
      ? [
          ...Array.from({ length: extraEmptyRows }, (_, index) => ({
            type: "empty",
            key: `before-child-${index}`,
          })),
          { type: "child-heading" },
          ...childSewadars.map((sewadar) => ({ type: "person", sewadar })),
          ...Array.from({ length: automaticChildSpacingRows }, (_, index) => ({
            type: "empty",
            key: `after-child-${index}`,
          })),
        ]
      : Array.from({ length: extraEmptyRows }, (_, index) => ({
          type: "empty",
          key: `tail-empty-${index}`,
        }))),
  ];
  const males = maleSewadars.length;
  const females = femaleSewadars.length;
  const children = childSewadars.length;
  const total = data.sewadars.length;
  const summaryText =
    children > 0
      ? `Males : _${males}_, Females : _${females}_, Children : _${children}_, Total : ${total}`
      : `Males : _${males}_, Females : _${females}_, Total : ${total}`;
  const getLineRowNumber = (index) =>
    displayRows
      .slice(0, index + 1)
      .filter((item) => item.type === "person" || item.type === "empty").length;

  const handleDownloadPdf = async () => {
    const printContent = document.getElementById("print-content");

    if (!printContent) {
      return;
    }

    setIsDownloading(true);

    try {
      await generatePdfFromElement(printContent, data.sheetName);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="njr-root">
      <style>{styles}</style>
      <div className="njr-actions">
        <button
          type="button"
          className="njr-download-btn"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
        >
          {isDownloading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      {/* A4 Page */}
      <div id="print-content" className="njr-page">
        <div className="njr-top-right-id">SCI/2020/84</div>

        {/* Logo + Title */}
        <div className="njr-logo-wrap">
          <div className="njr-logo-box">
            <div className="njr-logo-inner">
              <span>RS</span>
              <span>SB</span>
            </div>
          </div>
          <div className="njr-header-title">
            <h1>Satsang Centres in India</h1>
            <h2>Nominal Roll Sewa Jatha</h2>
            <div className="njr-header-id">ID - {data.sciRef}</div>
          </div>
        </div>

        {/* Registration Numbers */}
        <div className="njr-reg-block">
          {data.registrations.map((r, i) => (
            <React.Fragment key={i}>
              {r.label}: - {r.code}
              {i < data.registrations.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>

        {/* Meta Row 1 */}
        <div className="njr-meta-row njr-meta-row--top">
          <span>NAME OF SATSANG PLACE: <span className="njr-val">{data.satsangPlace}</span></span>
          <span>AREA: <span className="njr-val">{data.area}</span></span>
          <span>ZONE: <span className="njr-val">{data.zone}</span></span>
        </div>

        {/* Meta Row 2 */}
        <div className="njr-meta-row">
          <span className="njr-meta-pair">
            <span className="njr-meta-label">NAME OF JATHEDAR:</span>
            <span className="njr-val">{renderNamesOnSeparateLines(data.jathedar)}</span>
          </span>
          <span className="njr-meta-pair">
            <span className="njr-meta-label">NAME OF DRIVER:</span>
            <span className="njr-val">{renderNamesOnSeparateLines(data.driver)}</span>
          </span>
        </div>

        {/* Meta Row 3 */}
        <div className="njr-meta-row">
          <span className="njr-meta-pair">
            <span className="njr-meta-label">TYPE OF VEHICLE:</span>
            <span className="njr-val">{data.vehicleType}</span>
          </span>
          <span className="njr-meta-pair">
            <span className="njr-meta-label">VEHICLE NO:</span>
            <span className="njr-val">{renderVehicleNumbers(data.vehicleNo)}</span>
          </span>
        </div>

        {/* Meta Row 4 */}
        <div className="njr-meta-row">
          <span className="njr-meta-pair">
            <span className="njr-meta-label">PLACE OF SEWA:</span>
            <span className="njr-val">{data.placeOfSewa}</span>
          </span>
          <span className="njr-meta-pair">
            <span className="njr-meta-label">DURATION OF SEWA FROM:</span>
            <span className="njr-val">{data.sewaFrom}</span>{" "}
            <span>TO</span>
            <span className="njr-val">{data.sewaTo}</span>
          </span>
        </div>

        <div className="njr-mention">(Mention Beas Department or Centre as applicable)</div>

        {/* Table */}
        <table className="njr-table">
          <thead>
            <tr>
              <th className="sno center">S.No</th>
              <th className="name-col">
                NAME OF SEWADAR /<br />
                SEWADARNIS
              </th>
              <th className="father-col">FATHER/HUSBAND NAME</th>
              <th className="gender center">
                MALE /<br />
                FEMALE
              </th>
              <th className="age center">AGE</th>
              <th className="address-col">
                R/O VILLAGE / TOWN<br />
                / LOCALITY /DISTRICT
              </th>
              <th className="mobile-col">MOBILE NO</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, index) => {
              if (row.type === "child-heading") {
                return (
                  <tr key={`child-heading-${index}`} className="section-row">
                    <td />
                    <td />
                    <td className="section-label">CHILD</td>
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                );
              }

              if (row.type === "empty") {
                const rowNumber = getLineRowNumber(index);

                return (
                  <tr key={row.key} className="njr-no-break">
                    <td className="center sno-cell">{rowNumber}</td>
                    <td className="name-cell">&nbsp;</td>
                    <td className="father-cell">&nbsp;</td>
                    <td className="center">&nbsp;</td>
                    <td className="center">&nbsp;</td>
                    <td className="address-cell">&nbsp;</td>
                    <td className="mobile-cell">&nbsp;</td>
                  </tr>
                );
              }

              const s = row.sewadar;
              const sewadarIsJathedar = isJathedar(s);
              const rowNumber = getLineRowNumber(index);

              return (
                <tr key={`${s.name}-${index}`} className="njr-no-break">
                  <td className="center sno-cell">{rowNumber}</td>
                  <td
                    className={`name-cell${sewadarIsJathedar ? " njr-jathedar-name" : ""}`}
                  >
                    {toUppercaseText(s.name)}
                  </td>
                  <td className="father-cell">{s.fatherHusband}</td>
                  <td className="center">
                    {normalizeGender(s.gender) === "MALE"
                      ? "M"
                      : normalizeGender(s.gender) === "FEMALE"
                        ? "F"
                        : s.gender}
                  </td>
                  <td className="center">{s.age}</td>
                  <td className="address-cell">{s.address}</td>
                  <td className="mobile-cell">{s.mobileNumber || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary */}
        <div className="njr-summary">
          {summaryText}
        </div>
        <div className="njr-note">
          NOTE: &nbsp;1) {data.signatureNote}
        </div>

        {/* Footer Signatures */}
        <div className="njr-footer">
          <div className="njr-footer-left">
            <div className="njr-sig-block">
              (SIGNATURE OF JATHEDAR)<br />
              DATE: {data.jathedarSignature.date}<br />
              Contact No: <strong>{data.jathedarSignature.contact}</strong>
            </div>
          </div>
          <div className="njr-footer-right">
            <div className="njr-sig-block">
              (SIGNATURE OF FUNCTIONARY)<br />
              DATE: {data.functionarySignature.date}<br />
              Contact No: <strong>{data.functionarySignature.contact}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
