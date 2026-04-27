// app/api/sheets/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAdminRequest } from "@/lib/auth";
import Sheet from "@/models/Sheet";
import Record from "@/models/Record";
import "@/models/Person";

// GET /api/sheets - fetch all sheets, or one sheet with records using ?id=
export async function GET(request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid sheet ID" },
          { status: 400 }
        );
      }

      const sheet = await Sheet.findById(id).lean();
      if (!sheet) {
        return NextResponse.json(
          { success: false, message: "Sheet not found" },
          { status: 404 }
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
    }

    const sheets = await Sheet.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: sheets });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST /api/sheets — create a new sheet
export async function POST(request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    await connectDB();
    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Sheet name is required" },
        { status: 400 }
      );
    }

    const sheet = await Sheet.create({ name: name.trim() });
    return NextResponse.json({ success: true, data: sheet }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
