import { NextResponse } from "next/server"
import sql from "@/lib/db"

export async function GET() {
  try {
    // Get all devices ordered by created_at ASC (oldest first) for stable order
    const devices = await sql`
      SELECT * FROM devices ORDER BY created_at ASC
    `

    const currentTime = new Date()

    // Add is_online status based on last_seen
    const devicesWithStatus = devices.map((device: any) => {
      const lastSeen = new Date(device.last_seen)
      const timeDiff = (currentTime.getTime() - lastSeen.getTime()) / 1000 // in seconds

      return {
        device_id: device.device_id,
        device_name: device.device_name,
        os_version: device.os_version,
        phone_number: device.phone_number,
        battery_level: device.battery_level,
        is_online: timeDiff < 20, // Online if last seen within 20 seconds
        created_at: device.created_at,
      }
    })

    return NextResponse.json(devicesWithStatus)
  } catch (error) {
    console.error("[v0] Get devices error:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}
