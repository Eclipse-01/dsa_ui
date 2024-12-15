"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { VitalData } from "../types"

interface EditDialogProps {
  data: VitalData;
  open: boolean;
  onClose: () => void;
  onSave: (editedData: VitalData) => Promise<void>;
}

export function EditDialog({ data, open, onClose, onSave }: EditDialogProps) {
  const [editedData, setEditedData] = useState<VitalData>(data)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(editedData)
      onClose()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑数据</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {data.type === "血压" ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="systolic">收缩压</Label>
                <Input
                  id="systolic"
                  type="number"
                  value={editedData.systolic || editedData._value}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    systolic: Number(e.target.value)
                  })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="diastolic">舒张压</Label>
                <Input
                  id="diastolic"
                  type="number"
                  value={editedData.diastolic || 0}
                  onChange={(e) => setEditedData({
                    ...editedData,
                    diastolic: Number(e.target.value)
                  })}
                  className="col-span-3"
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value">数值</Label>
              <Input
                id="value"
                type="number"
                value={editedData._value}
                onChange={(e) => setEditedData({
                  ...editedData,
                  _value: Number(e.target.value)
                })}
                className="col-span-3"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
