import { NextResponse } from "next/server"

/**
 * Health check endpoint for Render
 * Render will ping this endpoint to monitor service health
 */
export async function GET() {
  try {
    // Basic health check - just return 200 OK
    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "salone-bellezza-prenotazioni",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

