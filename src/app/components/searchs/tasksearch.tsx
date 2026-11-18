"use client"

import * as React from "react";
import { TaskDepartments, TaskStatuses } from "@/core/constants";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { SelectWithLabel } from "../../../lib/components/web/react/uicustom/selectwithlabel";
import { useParams } from "next/navigation";
import TaskNewDialog from "../dialogs/tasknewdialog";

interface Props {
  formRef?: React.RefObject<HTMLFormElement | null>;
}

const departmentItems = new Map<string, string>([["DEFAULT", "All"], ...TaskDepartments.map(d => [d, d] as [string, string])]);
const statusItems = new Map<string, string>([["DEFAULT", "All"], ...TaskStatuses.map(s => [s, s] as [string, string])]);
const overdueItems = new Map<string, string>([["DEFAULT", "All"], ["OVERDUE", "Overdue"]]);

export default function TaskSearch({ formRef }: Props) {
  const [department, setDepartment] = React.useState("DEFAULT");
  const [status, setStatus] = React.useState("DEFAULT");
  const [overdue, setOverdue] = React.useState("DEFAULT");
  const [newOpen, setNewOpen] = React.useState(false);
  const params = useParams();
  const location = params.location as string;

  return (
    <section aria-label="Task Search" className="flex w-full flex-col gap-4">
      <div className="flex gap-4 flex-wrap items-end">
        <InputWithLabel labelPosition="top" size="md" label="Reservation Id" name="searchReservationId" defaultValue="" />
        <InputWithLabel labelPosition="top" size="md" label="Customer Name" name="searchCustomerName" defaultValue="" />
        <SelectWithLabel label="Department" labelPosition="top" items={departmentItems} value={department} onValueChange={setDepartment} />
        <SelectWithLabel label="Status" labelPosition="top" items={statusItems} value={status} onValueChange={setStatus} />
        <SelectWithLabel label="Overdue Status" labelPosition="top" items={overdueItems} value={overdue} onValueChange={setOverdue} />
        <input type="hidden" name="searchDepartment" value={department} />
        <input type="hidden" name="searchStatus" value={status} />
        <input type="hidden" name="searchOverdue" value={overdue} />
        <ButtonCustom variant="black" type="button" onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
        <ButtonCustom variant="green" type="button" onClick={() => setNewOpen(true)}>New Task</ButtonCustom>
      </div>
      <TaskNewDialog open={newOpen} onOpenChange={setNewOpen} location={location} onCreated={() => formRef?.current?.requestSubmit()} />
    </section>
  );
}
