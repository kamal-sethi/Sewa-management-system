// app/api/people/search/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminRequest } from "@/lib/auth";
import Person from "@/models/Person";

// GET /api/people/search?name=xyz — autocomplete search
export async function GET(request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name")?.trim();

    if (!name || name.length < 1) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Case-insensitive prefix search — fast and intuitive for autocomplete
    const people = await Person.find({
      name: { $regex: `^${name}`, $options: "i" },
    })
      .limit(8)
      .lean();

    // If no prefix matches, fall back to contains search
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
