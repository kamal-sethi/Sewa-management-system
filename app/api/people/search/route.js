// app/api/people/search/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  requireAdminRequest,
  getSessionFromRequest,
  getDatabaseName,
} from "@/lib/auth";
import Person from "@/models/Person";

// GET /api/people/search?name=xyz
export async function GET(request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    // 🔥 NEW: DB SWITCH
    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name")?.trim();

    if (!name || name.length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Prefix search
    const people = await Person.find({
      name: { $regex: `^${name}`, $options: "i" },
    })
      .limit(8)
      .lean();

    // Fallback search
    if (people.length === 0) {
      const fallback = await Person.find({
        name: { $regex: name, $options: "i" },
      })
        .limit(8)
        .lean();

      return NextResponse.json({ success: true, data: fallback });
    }

    return NextResponse.json({ success: true, data: people });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}