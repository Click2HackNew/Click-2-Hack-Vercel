import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ deviceId: string }> }) {
  try {
    const { deviceId } = await params

    // Get only pending commands
    const commands = await sql`
      SELECT * FROM commands
      WHERE device_id = ${deviceId} AND status = 'pending'
      ORDER BY created_at ASC
    `

    // Parse command_data from JSON string
    const parsedCommands = commands.map((cmd: any) => ({
      id: cmd.id,
      device_id: cmd.device_id,
      command_type: cmd.command_type,
      command_data: JSON.parse(cmd.command_data),
      status: cmd.status,
      created_at: cmd.created_at,
    }))

    // Immediately mark these commands as 'sent' to prevent duplicate execution
    if (commands.length > 0) {
      const commandIds = commands.map((cmd: any) => cmd.id)
      await sql`
        UPDATE commands
        SET status = 'sent'
        WHERE id = ANY(${commandIds})
      `
    }

    return NextResponse.json(parsedCommands)
  } catch (error) {
    console.error("[v0] Get commands error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
