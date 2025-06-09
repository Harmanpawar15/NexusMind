import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

// Store in memory (use database like Supabase for prod)
const conversations: Record<string, any> = {};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = nanoid(8); // short ID
  conversations[id] = body; // store conversation by ID
  return NextResponse.json({ id });
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  const convo = conversations[id];

  if (!convo) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({ messages: convo });
}
