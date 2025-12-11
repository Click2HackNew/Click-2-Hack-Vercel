import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params

    // Delete device and all related data
    await sql`DELETE FROM devices WHERE device_id = ${deviceId}`
    await sql`DELETE FROM commands WHERE device_id = ${deviceId}`
    await sql`DELETE FROM sms_logs WHERE device_id = ${deviceId}`
    await sql`DELETE FROM form_submissions WHERE device_id = ${deviceId}`

    return NextResponse.json({
      status: "success",
      message: "Device deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Delete device error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
