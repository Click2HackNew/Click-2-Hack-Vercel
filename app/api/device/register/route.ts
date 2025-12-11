import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { device_id, device_name, os_version, battery_level, phone_number } = body

    if (!device_id) {
      return NextResponse.json({ status: "error", message: "device_id is required" }, { status: 400 })
    }

    // Check if device exists
    const existingDevice = await sql`
      SELECT * FROM devices WHERE device_id = ${device_id}
    `

    const now = new Date().toISOString()

    if (existingDevice.length === 0) {
      // Insert new device
      await sql`
        INSERT INTO devices (device_id, device_name, os_version, battery_level, phone_number, last_seen, created_at)
        VALUES (${device_id}, ${device_name}, ${os_version}, ${battery_level}, ${phone_number}, ${now}, ${now})
      `
    } else {
      // Update existing device - only update last_seen and other dynamic fields
      await sql`
        UPDATE devices
        SET device_name = ${device_name},
            os_version = ${os_version},
            battery_level = ${battery_level},
            phone_number = ${phone_number},
            last_seen = ${now}
        WHERE device_id = ${device_id}
      `
    }

    return NextResponse.json({
      status: "success",
      message: "Device data received.",
    })
  } catch (error) {
    console.error("[v0] Device registration error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
