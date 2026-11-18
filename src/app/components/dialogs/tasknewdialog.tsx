"use client";

import * as React from "react";
import { toast } from "sonner";
import { TaskDepartments } from "@/core/constants";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import { Label } from "@/lib/components/web/react/ui/label";
import { Textarea } from "@/lib/components/web/react/ui/textarea";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  location: string;
}

const departmentItems = new Map<string, string>(TaskDepartments.map(d => [d, d]));
const textareaStyle = { fieldSizing: "fixed", height: "7rem", minHeight: "7rem" } as React.CSSProperties;

export default function TaskNewDialog({ open, onOpenChange, onCreated, location }: Props) {
  const [description, setDescription] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [target, setTarget] = React.useState("");
  const [remark, setRemark] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setDescription("");
      setDepartment("");
      setTarget("");
      setRemark("");
    }
  }, [open]);

  const save = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Resort-Location": location },
        body: JSON.stringify({
          description,
          department: department || null,
          remark,
          targetCompletionDateTime: target ? new Date(target).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Create task failed.");
      toast(json.message || "Task created.");
      onOpenChange(false);
      onCreated();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Create task failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ minWidth: "50vw" }} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
          <DialogDescription className="sr-only">Create a new task</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            This dialog creates an internal task that is not related to any reservation or customer.
            To create a task for a customer-related complaint, use the Reservation List page or the Room Change page.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-task-description">Description</Label>
            <Textarea id="new-task-description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className="resize-y" style={textareaStyle} disabled={isSaving} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Department</Label>
              <SelectWithLabel label="" size="full" items={departmentItems} value={department || undefined} onValueChange={setDepartment} disabled={isSaving} />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <Label htmlFor="new-task-target">Target Completion Date/Time</Label>
              <input id="new-task-target" type="datetime-local" value={target} onChange={e => setTarget(e.target.value)} disabled={isSaving}
                className="h-9 w-56 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-task-remark">Remark</Label>
            <Textarea id="new-task-remark" rows={4} maxLength={255} value={remark} onChange={e => setRemark(e.target.value)} className="resize-y" style={textareaStyle} disabled={isSaving} />
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
