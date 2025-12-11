import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params
    const body = await request.json()
    const { sender, message_body } = body

    if (!sender || !message_body) {
      return NextResponse.json({ status: "error", message: "sender and message_body are required" }, { status: 400 })
    }

    const now = new Date().toISOString()

    await sql`
      INSERT INTO sms_logs (device_id, sender, message_body, received_at)
      VALUES (${deviceId}, ${sender}, ${message_body}, ${now})
    `

    return NextResponse.json({
      status: "success",
      message: "SMS logged successfully",
    })
  } catch (error) {
    console.error("[v0] Log SMS error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params

    const smsLogs = await sql`
      SELECT * FROM sms_logs
      WHERE device_id = ${deviceId}
      ORDER BY received_at DESC
    `

    return NextResponse.json(smsLogs)
  } catch (error) {
    console.error("[v0] Get SMS logs error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
