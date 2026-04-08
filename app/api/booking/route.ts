import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, email, preferredTime } = body as {
      name: string;
      age: number;
      email: string;
      preferredTime: string;
    };

    // Basic server-side validation
    if (!name?.trim() || !email?.trim() || !preferredTime || typeof age !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (convexUrl) {
      // Forward to Convex HTTP action (or use the Convex REST API)
      // When convex/_generated is available, you can use ConvexHttpClient here.
      // For now: log and succeed. Wire this in after `npx convex dev`.
      console.log('[booking] Would persist to Convex:', { name, age, email, preferredTime });
    } else {
      // Convex not configured — log locally
      console.log('[booking] Convex not configured. Received:', { name, age, email, preferredTime });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[booking] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
