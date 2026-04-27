// app/api/records/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminRequest } from "@/lib/auth";
import Record from "@/models/Record";
import { normalizeFareInput } from "@/lib/fare";

// POST /api/records — add a person to a sheet
export async function POST(request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    await connectDB();
    const body = await request.json();
    const { sheetId, personId, fare, remarks } = body;

    if (!sheetId || !personId) {
      return NextResponse.json(
        { success: false, message: "sheetId and personId are required" },
        { status: 400 }
      );
    }

    // Check for duplicate (same person in same sheet)
    const existing = await Record.findOne({ sheetId, personId });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "This person is already added to this sheet",
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

    // Return record with populated person
    const populated = await record.populate("personId");

    return NextResponse.json(
      { success: true, data: populated },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
