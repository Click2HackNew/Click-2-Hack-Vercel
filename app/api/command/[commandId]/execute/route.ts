import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ commandId: string }> }) {
  try {
    const { commandId } = await params

    // Mark command as executed
    await sql`
      UPDATE commands
      SET status = 'executed'
      WHERE id = ${commandId}
    `

    return NextResponse.json({
      status: "success",
      message: "Command marked as executed",
    })
  } catch (error) {
    console.error("[v0] Execute command error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
