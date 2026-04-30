// app/api/records/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminRequest } from "@/lib/auth";
import Record from "@/models/Record";
import { normalizeFareInput } from "@/lib/fare";
import { getDatabaseName, getSessionFromRequest } from "../../../../lib/auth";

const getRecordId = async (params) => {
  const resolvedParams = await params;
  return resolvedParams.id;
};

// PUT /api/records/:id — update fare and remarks
export async function PUT(request, { params }) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);
    const id = await getRecordId(params);
    const body = await request.json();
    const { fare, remarks } = body;

    const record = await Record.findByIdAndUpdate(
      id,
      {
        fare: normalizeFareInput(fare),
        remarks: remarks?.trim() || "",
      },
      { new: true, runValidators: true },
    ).populate("personId");

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/records/:id — remove a person from a sheet
export async function DELETE(request, { params }) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);
    const id = await getRecordId(params);
    const record = await Record.findByIdAndDelete(id);

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Record removed from sheet",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
