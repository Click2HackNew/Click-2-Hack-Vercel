import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegram_bot_token, telegram_chat_id } = body

    if (!telegram_bot_token || !telegram_chat_id) {
      return NextResponse.json(
        { status: "error", message: "Both telegram_bot_token and telegram_chat_id are required" },
        { status: 400 },
      )
    }

    // Upsert both settings
    await sql`
      INSERT INTO global_settings (setting_key, setting_value)
      VALUES ('telegram_bot_token', ${telegram_bot_token})
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = ${telegram_bot_token}
    `

    await sql`
      INSERT INTO global_settings (setting_key, setting_value)
      VALUES ('telegram_chat_id', ${telegram_chat_id})
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = ${telegram_chat_id}
    `

    return NextResponse.json({
      status: "success",
      message: "Telegram details updated successfully.",
    })
  } catch (error) {
    console.error("[v0] Update telegram details error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const token = await sql`
      SELECT setting_value FROM global_settings WHERE setting_key = 'telegram_bot_token'
    `
    const chatId = await sql`
      SELECT setting_value FROM global_settings WHERE setting_key = 'telegram_chat_id'
    `

    return NextResponse.json({
      telegram_bot_token: token.length > 0 ? token[0].setting_value : null,
      telegram_chat_id: chatId.length > 0 ? chatId[0].setting_value : null,
    })
  } catch (error) {
    console.error("[v0] Get telegram details error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
