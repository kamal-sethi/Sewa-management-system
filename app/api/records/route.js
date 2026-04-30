import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminRequest } from "@/lib/auth";
import Record from "@/models/Record";
import { normalizeFareInput } from "@/lib/fare";
import { getDatabaseName, getSessionFromRequest } from "../../../lib/auth";

let duplicateIndexChecked = false;

async function ensureLegacyDuplicateIndexRemoved() {
  if (duplicateIndexChecked) return;

  try {
    const indexes = await Record.collection.indexes();
    const duplicateIndex = indexes.find(
      (index) =>
        index.name === "sheetId_1_personId_1" && index.unique === true
    );

    if (duplicateIndex) {
      await Record.collection.dropIndex("sheetId_1_personId_1");
    }
  } catch {
    // Ignore cleanup failures and continue with normal request handling.
  } finally {
    duplicateIndexChecked = true;
  }
}

// POST /api/records - add a person to a sheet
export async function POST(request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);
    await ensureLegacyDuplicateIndexRemoved();

    const body = await request.json();
    const { sheetId, personId, fare, remarks, allowDuplicate } = body;

    if (!sheetId || !personId) {
      return NextResponse.json(
        { success: false, message: "sheetId and personId are required" },
        { status: 400 }
      );
    }

    const existing = await Record.findOne({ sheetId, personId });
    if (existing && !allowDuplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This exact person is already added to this sheet. You can still add them again if needed.",
          duplicate: true,
        },
        { status: 409 }
      );
    }

    const record = await Record.create({
      sheetId,
      personId,
      fare: normalizeFareInput(fare),
      remarks: remarks || "",
    });

    const populated = await record.populate("personId");

    return NextResponse.json(
      { success: true, data: populated },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This exact person is already added to this sheet. You can still add them again if needed.",
          duplicate: true,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
