import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import { reportError } from "@/lib/error-reporting";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message, recaptchaToken } = body as Record<
    string,
    unknown
  >;

  // Validate fields
  if (
    typeof name !== "string" ||
    name.trim().length < 1 ||
    name.trim().length > 100
  ) {
    return NextResponse.json({ error: "Invalid name" }, { status: 422 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 422 });
  }
  if (
    typeof message !== "string" ||
    message.trim().length < 1 ||
    message.trim().length > 2000
  ) {
    return NextResponse.json({ error: "Invalid message" }, { status: 422 });
  }
  if (typeof recaptchaToken !== "string" || !recaptchaToken) {
    return NextResponse.json(
      { error: "Missing reCAPTCHA token" },
      { status: 422 },
    );
  }

  // Verify reCAPTCHA v3
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    reportError(new Error("RECAPTCHA_SECRET_KEY not configured"), {
      op: "contact.recaptcha",
    });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  try {
    const recaptchaRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: recaptchaToken,
        }),
      },
    );
    const recaptchaData = (await recaptchaRes.json()) as {
      success: boolean;
      score?: number;
    };

    if (!recaptchaData.success || (recaptchaData.score ?? 0) < 0.5) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 422 },
      );
    }
  } catch (error) {
    reportError(error, { op: "contact.recaptcha" });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // Send email
  try {
    await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
  } catch (error) {
    reportError(error, { op: "contact.send" });
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
