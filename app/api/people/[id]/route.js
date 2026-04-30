// app/api/people/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  requireAdminRequest,
  getSessionFromRequest,
  getDatabaseName,
} from "@/lib/auth";
import Person from "@/models/Person";

const getPersonId = async (params) => {
  const resolvedParams = await params;
  return resolvedParams.id;
};

export async function PUT(request, { params }) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    // 🔥 NEW: DB SWITCH
    const session = await getSessionFromRequest(request);
    const dbName = getDatabaseName(session);
    await connectDB(dbName);

    const id = await getPersonId(params);
    const body = await request.json();

    const {
      name,
      fatherOrHusbandName,
      age,
      gender,
      mobileNumber,
      aadharNumber,
      address,
    } = body;

    if (!name?.trim() || !fatherOrHusbandName?.trim() || !age || !gender) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, Father/Husband Name, Age, and Gender are required",
        },
        { status: 400 }
      );
    }

    if (mobileNumber && mobileNumber.trim().length > 0) {
      const mobileDigits = mobileNumber.replace(/\D/g, "");
      if (mobileDigits.length !== 10) {
        return NextResponse.json(
          {
            success: false,
            message: "Mobile number must be exactly 10 digits",
          },
          { status: 400 }
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
          { status: 400 }
        );
      }
    }

    const person = await Person.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim(),
        age: Number(age),
        gender,
        mobileNumber: mobileNumber?.trim() || "",
        aadharNumber: aadharNumber?.trim() || "",
        address: address?.trim() || "",
      },
      { new: true, runValidators: true }
    );

    if (!person) {
      return NextResponse.json(
        { success: false, message: "Person not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
