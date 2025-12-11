import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ smsId: string }> }) {
  try {
    const { smsId } = await params

    await sql`DELETE FROM sms_logs WHERE id = ${smsId}`

    return NextResponse.json({
      status: "success",
      message: "SMS deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Delete SMS error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
