import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { device_id, command_type, command_data } = body

    if (!device_id || !command_type || !command_data) {
      return NextResponse.json(
        { status: "error", message: "device_id, command_type, and command_data are required" },
        { status: 400 },
      )
    }

    // Store command_data as JSON string
    const commandDataStr = JSON.stringify(command_data)
    const now = new Date().toISOString()

    await sql`
      INSERT INTO commands (device_id, command_type, command_data, status, created_at)
      VALUES (${device_id}, ${command_type}, ${commandDataStr}, 'pending', ${now})
    `

    return NextResponse.json({
      status: "success",
      message: "Command sent successfully",
    })
  } catch (error) {
    console.error("[v0] Send command error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
