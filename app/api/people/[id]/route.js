// app/api/people/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminRequest } from "@/lib/auth";
import Person from "@/models/Person";

const getPersonId = async (params) => {
  const resolvedParams = await params;
  return resolvedParams.id;
};

// PUT /api/people/:id — update person details
export async function PUT(request, { params }) {
  try {
    const authError = await requireAdminRequest(request);
    if (authError) return authError;

    await connectDB();
    const id = await getPersonId(params);
    const body = await request.json();
    const { name, fatherOrHusbandName, age, gender, mobileNumber, address } =
      body;

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

    const person = await Person.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        fatherOrHusbandName: fatherOrHusbandName.trim(),
        age: Number(age),
        gender,
        mobileNumber: mobileNumber?.trim() || "",
        address: address?.trim() || "",
      },
      { new: true, runValidators: true },
    );

    if (!person) {
      return NextResponse.json(
        { success: false, message: "Person not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: person });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
