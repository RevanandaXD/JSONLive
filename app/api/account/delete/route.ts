import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { email?: string } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (
      !body.email ||
      body.email.trim().toLowerCase() !== session.user.email.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Email verification required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { deleteRequestedAt: now },
      select: { id: true, deleteRequestedAt: true },
    });

    return NextResponse.json({
      message: "Account deletion request queued. Your account will be permanently deleted in 3 days unless cancelled.",
      deleteRequestedAt: updatedUser.deleteRequestedAt,
    });
  } catch (error) {
    console.error("Account deletion request error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}