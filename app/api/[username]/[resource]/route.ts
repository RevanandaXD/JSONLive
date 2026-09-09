import { NextResponse } from "next/server";

type DbParams = {
  username: string;
  resource: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const mockStore: Record<string, Record<string, unknown>> = {
  revan: {
    users: [
      { id: 1, name: "Revan" },
      { id: 2, name: "Budi" },
    ],
    profile: {
      name: "Revan",
      role: "Developer",
      skills: ["React", "Next.js"],
    },
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<DbParams> },
) {
  const { username, resource } = await params;

  const userData = mockStore[username];
  const data = userData?.[resource];

  if (data === undefined) {
    return NextResponse.json(
      { error: "Resource not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  return NextResponse.json(data, { headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
