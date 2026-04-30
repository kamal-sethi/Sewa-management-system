import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import SewaJathaNominalRoll from "@/components/Sewajathanominalroll";
import { connectDB } from "@/lib/mongodb";
import {
  AUTH_COOKIE_NAME,
  getDatabaseName,
  verifySessionToken,
} from "@/lib/auth";
import Sheet from "@/models/Sheet";
import Record from "@/models/Record";
import "@/models/Person";

export const dynamic = "force-dynamic";

const splitDuration = (duration = "") => {
  const [from = "", to = ""] = duration.split(/\s*to\s*/i);
  return {
    sewaFrom: from.trim(),
    sewaTo: to.trim(),
  };
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Calcutta",
  }).format(date);

const toNominalRollData = (sheet, records, extraEmptyRows = 0) => {
  const { sewaFrom, sewaTo } = splitDuration(sheet.sewaDuration);
  const today = formatDate(new Date());

  return {
    sheetName: sheet.name || "document",
    sciRef: sheet.nominalRollId || "",
    registrations: [],
    satsangPlace: "RAJPURA",
    area: "PATIALA",
    zone: "III",
    jathedar: sheet.jathedarName || "",
    driver: sheet.driverName || "",
    vehicleType: "BUS",
    vehicleNo: sheet.busNumber || "",
    placeOfSewa: sheet.sewaName || sheet.name || "",
    sewaFrom,
    sewaTo,
    sewadars: records.map((record) => {
      const person = record.personId || {};
      return {
        recordId: String(record._id || ""),
        personId: String(person._id || ""),
        name: person.name || "",
        fatherHusband: person.fatherOrHusbandName || "",
        gender: person.gender ? person.gender.toUpperCase() : "",
        age: person.age || "",
        mobileNumber: person.mobileNumber || "",
        address: person.address || "",
      };
    }),
    signatureNote:
      "THE IDENTITY, AGE AND PHYSICAL FITNESS OF MECH. SEWADAR IS HEREBY CONFIRMED.",
    functionary: {
      name: "",
      title: "",
    },
    jathedarSignature: {
      date: today,
      contact: sheet.jathedarMobileNumber || "",
    },
    functionarySignature: {
      date: today,
      contact: "9988160787",
    },
    extraEmptyRows,
  };
};

export default async function Page({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const parsedExtraLines = Number(resolvedSearchParams?.extraLines ?? "0");
  const extraEmptyRows =
    Number.isFinite(parsedExtraLines) && parsedExtraLines >= 0
      ? Math.floor(parsedExtraLines)
      : 0;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  const dbName = getDatabaseName(session);

  await connectDB(dbName);

  const sheet = await Sheet.collection.findOne({
    _id: new mongoose.Types.ObjectId(id),
  });
  if (!sheet) {
    notFound();
  }

  const records = await Record.find({ sheetId: id })
    .populate("personId")
    .sort({ createdAt: 1 })
    .lean();

  return (
    <SewaJathaNominalRoll
      data={toNominalRollData(sheet, records, extraEmptyRows)}
    />
  );
}
