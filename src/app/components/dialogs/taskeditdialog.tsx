"use client";

import * as React from "react";
import { toast } from "sonner";
import { TaskDepartments, TaskStatuses } from "@/core/constants";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import { Label } from "@/lib/components/web/react/ui/label";
import { Textarea } from "@/lib/components/web/react/ui/textarea";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel";

export interface TaskEditRow {
  id: string;
  reservationId: string | null;
  customerName: string | null;
  customerLocalName: string | null;
  description: string;
  department: string | null;
  status: string;
  remark: string | null;
  targetCompletionDateTime: string | null;
}

interface Props {
  task: TaskEditRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  location: string;
}

const departmentItems = new Map<string, string>(TaskDepartments.map(d => [d, d]));
const statusItems = new Map<string, string>(TaskStatuses.map(s => [s, s]));

// The base Textarea auto-sizes to content; fixed sizing makes 4 rows the minimum height.
// ISO UTC from the API to the local value format required by datetime-local.
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const textareaStyle = { fieldSizing: "fixed", height: "7rem", minHeight: "7rem" } as React.CSSProperties;

export default function TaskEditDialog({ task, open, onOpenChange, onSaved, location }: Props) {
  const [description, setDescription] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [status, setStatus] = React.useState("OPEN");
  const [remark, setRemark] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && task) {
      setDescription(task.description ?? "");
      setDepartment(task.department ?? "");
      setStatus(task.status || "OPEN");
      setRemark(task.remark ?? "");
      setTarget(toLocalInput(task.targetCompletionDateTime));
    }
  }, [open, task]);

  const save = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Resort-Location": location },
        body: JSON.stringify({ description, department, status, remark, targetCompletionDateTime: target ? new Date(target).toISOString() : null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Update failed.");
      toast(json.message || "Task updated.");
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const customerName = [task?.customerName, task?.customerLocalName].filter(Boolean).join(" / ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ minWidth: "50vw" }} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription className="sr-only">Edit task details</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 rounded-md border border-border bg-muted/40 p-4 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Reservation Id</span>
            <span className="break-all">{task?.reservationId || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Customer</span>
            <span>{customerName || "-"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea id="task-description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className="resize-y" style={textareaStyle} disabled={isSaving} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Department</Label>
              <SelectWithLabel label="" size="full" items={departmentItems} value={department || undefined} onValueChange={setDepartment} disabled={isSaving} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <SelectWithLabel label="" size="full" items={statusItems} value={status} onValueChange={setStatus} disabled={isSaving} />
            </div>
          </div>

          <div className="flex flex-col items-start gap-1.5">
            <Label htmlFor="task-target">Target Completion Date/Time</Label>
            <input id="task-target" type="datetime-local" value={target} onChange={e => setTarget(e.target.value)} disabled={isSaving}
              className="h-9 w-56 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-remark">Remark</Label>
            <Textarea id="task-remark" rows={4} maxLength={255} value={remark} onChange={e => setRemark(e.target.value)} className="resize-y" style={textareaStyle} disabled={isSaving} />
            <span className="self-end text-xs text-muted-foreground">{remark.length}/255</span>
          </div>
        </div>

        <DialogFooter>
          <ButtonCustom variant="black" type="button" onClick={save} disabled={isSaving || !description.trim()}>
            {isSaving ? "Saving..." : "Save"}
          </ButtonCustom>
          <ButtonCustom variant="red" type="button" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</ButtonCustom>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
