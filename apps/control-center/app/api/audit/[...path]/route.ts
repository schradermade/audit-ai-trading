/**
 * Proxy route for Audit MCP service
 */

import { NextRequest, NextResponse } from "next/server";

const AUDIT_MCP_URL =
  process.env.AUDIT_MCP_URL || "http://localhost:8010";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${AUDIT_MCP_URL}/${path}${
    searchParams ? `?${searchParams}` : ""
  }`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from audit-mcp service" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join("/");
  const url = `${AUDIT_MCP_URL}/${path}`;

  try {
    const body = await request.json();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from audit-mcp service" },
      { status: 500 }
    );
  }
}
