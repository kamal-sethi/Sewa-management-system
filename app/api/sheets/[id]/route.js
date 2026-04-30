import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAdminRequest } from "@/lib/auth";
import Sheet from "@/models/Sheet";
import Record from "@/models/Record";
import "@/models/Person";
import { getDatabaseName, getSessionFromRequest } from "../../../../lib/auth";

const getSheetId = async (params) => {
  const resolvedParams = await params;
  return resolvedParams.id;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const SHEET_DETAIL_FIELDS = [
  "driverName",
  "vehicleType",
  "busNumber",
  "jathedarName",
  "jathedarMobileNumber",
  "sewaDuration",
  "sewaName",
  "nominalRollId",
];
const VEHICLE_TYPES = new Set(["Bus", "Jeep", "Car"]);

// GET /api/sheets/:id - fetch one sheet with its records
export async function GET(request, { params }) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);
    const id = await getSheetId(params);

    if (!isValidId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid sheet ID" },
        { status: 400 },
      );
    }

    const sheet = await Sheet.collection.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!sheet) {
      return NextResponse.json(
        { success: false, message: "Sheet not found" },
        { status: 404 },
      );
    }

    const records = await Record.find({ sheetId: id })
      .populate("personId")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: { ...sheet, records },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// PUT /api/sheets/:id - update sheet details
export async function PUT(request, { params }) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

   const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);
    const id = await getSheetId(params);
    const body = await request.json();

    if (!isValidId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid sheet ID" },
        { status: 400 },
      );
    }

    const update = {};

    if ("name" in body) {
      if (!body.name?.trim()) {
        return NextResponse.json(
          { success: false, message: "Sheet name is required" },
          { status: 400 },
        );
      }
      update.name = body.name.trim();
    }

    if ("jathedarMobileNumber" in body) {
      const mobileDigits = String(body.jathedarMobileNumber || "").replace(
        /\D/g,
        "",
      );

      if (mobileDigits.length !== 10) {
        return NextResponse.json(
          {
            success: false,
            message: "Jathedar mobile number must be exactly 10 digits",
          },
          { status: 400 },
        );
      }
    }

    if ("vehicleType" in body) {
      const normalizedVehicleType = String(body.vehicleType || "").trim();

      if (!VEHICLE_TYPES.has(normalizedVehicleType)) {
        return NextResponse.json(
          {
            success: false,
            message: "Vehicle type must be Bus, Jeep, or Car",
          },
          { status: 400 },
        );
      }
    }

    SHEET_DETAIL_FIELDS.forEach((field) => {
      if (field in body) {
        update[field] =
          field === "jathedarMobileNumber"
            ? String(body[field] || "")
                .replace(/\D/g, "")
                .slice(0, 10)
            : body[field]?.trim() || "";
      }
    });

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, message: "No sheet details provided" },
        { status: 400 },
      );
    }

    const sheet = await Sheet.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    ).lean();

    if (!sheet) {
      return NextResponse.json(
        { success: false, message: "Sheet not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: sheet });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/sheets/:id - delete sheet and its records
export async function DELETE(request, { params }) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);
    const id = await getSheetId(params);

    if (!isValidId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid sheet ID" },
        { status: 400 },
      );
    }

    const sheet = await Sheet.findByIdAndDelete(id);
    if (!sheet) {
      return NextResponse.json(
        { success: false, message: "Sheet not found" },
        { status: 404 },
      );
    }

    await Record.deleteMany({ sheetId: id });

    return NextResponse.json({
      success: true,
      message: "Sheet deleted",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
