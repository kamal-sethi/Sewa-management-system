import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  validateAdminCredentials,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const validation = validateAdminCredentials(
      body?.username,
      body?.password,
    );

    if (!validation.ok) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ success: true });
    const cookie = await buildSessionCookie(
      validation.username,
      Boolean(body?.rememberMe),
    );
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid login request." },
      { status: 400 },
    );
  }
}
