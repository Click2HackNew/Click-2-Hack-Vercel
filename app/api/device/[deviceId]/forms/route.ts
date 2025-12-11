import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params
    const body = await request.json()
    const { custom_data } = body

    if (!custom_data) {
      return NextResponse.json({ status: "error", message: "custom_data is required" }, { status: 400 })
    }

    const now = new Date().toISOString()

    await sql`
      INSERT INTO form_submissions (device_id, custom_data, submitted_at)
      VALUES (${deviceId}, ${custom_data}, ${now})
    `

    return NextResponse.json({
      status: "success",
      message: "Form submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Submit form error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params

    const forms = await sql`
      SELECT * FROM form_submissions
      WHERE device_id = ${deviceId}
      ORDER BY submitted_at DESC
    `

    return NextResponse.json(forms)
  } catch (error) {
    console.error("[v0] Get forms error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
