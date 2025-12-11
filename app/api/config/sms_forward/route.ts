import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { forward_number } = body

    if (!forward_number) {
      return NextResponse.json({ status: "error", message: "forward_number is required" }, { status: 400 })
    }

    // Upsert the forwarding number
    await sql`
      INSERT INTO global_settings (setting_key, setting_value)
      VALUES ('sms_forward_number', ${forward_number})
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = ${forward_number}
    `

    return NextResponse.json({
      status: "success",
      message: "Forwarding number updated successfully.",
    })
  } catch (error) {
    console.error("[v0] Update forwarding number error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const result = await sql`
      SELECT setting_value FROM global_settings WHERE setting_key = 'sms_forward_number'
    `

    const forward_number = result.length > 0 ? result[0].setting_value : null

    return NextResponse.json({ forward_number })
  } catch (error) {
    console.error("[v0] Get forwarding number error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
