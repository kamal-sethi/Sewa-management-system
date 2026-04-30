// app/api/people/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminRequest } from "@/lib/auth";
import Person from "@/models/Person";
import { getDatabaseName, getSessionFromRequest } from "../../../lib/auth";

// GET /api/people — fetch all people
export async function GET(request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);
    const people = await Person.find().sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: people });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST /api/people — create a new person
export async function POST(request) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);
    const body = await request.json();
    const {
      name,
      fatherOrHusbandName,
      age,
      gender,
      mobileNumber,
      aadharNumber,
      address,
    } =
      body;

    // Validate required fields
    if (!name?.trim() || !fatherOrHusbandName?.trim() || !age || !gender) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, Father/Husband Name, Age, and Gender are required",
        },
        { status: 400 },
      );
    }

    // Validate mobile number if provided
    if (mobileNumber && mobileNumber.trim().length > 0) {
      const mobileDigits = mobileNumber.replace(/\D/g, "");
      if (mobileDigits.length !== 10) {
        return NextResponse.json(
          {
            success: false,
            message: "Mobile number must be exactly 10 digits",
          },
          { status: 400 },
        );
      }
    }

    if (aadharNumber && aadharNumber.trim().length > 0) {
      const aadharDigits = aadharNumber.replace(/\D/g, "");
      if (aadharDigits.length !== 12) {
        return NextResponse.json(
          {
            success: false,
            message: "Aadhaar number must be exactly 12 digits",
          },
          { status: 400 },
        );
      }
    }

    const person = await Person.create({
      name: name.trim(),
      fatherOrHusbandName: fatherOrHusbandName.trim(),
      age: Number(age),
      gender,
      mobileNumber: mobileNumber?.trim() || "",
      aadharNumber: aadharNumber?.trim() || "",
      address: address?.trim() || "",
    });

    return NextResponse.json({ success: true, data: person }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
