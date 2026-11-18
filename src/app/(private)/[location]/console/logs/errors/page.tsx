"use client";

import * as React from "react";
import { useActionState } from "react";
import { useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import DataTable from "@/lib/components/web/react/uicustom/datatable";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { InputWithLabel } from "@/lib/components/web/react/uicustom/inputwithlabel";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { errorLogGetList } from "./actions";

type ErrorLog = {
  id: string;
  datetime: string;
  userId: string | null;
  userName: string | null;
  detail: string;
};

const columns: ColumnDef<ErrorLog>[] = [
  { accessorKey: "id", header: "Log ID" },
  { accessorKey: "datetime", header: "Date Time", cell: ({ row }) => new Date(row.original.datetime).toLocaleString() },
  { accessorKey: "userName", header: "User Name", cell: ({ row }) => row.original.userName || row.original.userId || "-" },
  { accessorKey: "detail", header: "Log Detail",size:500, cell: ({ row }) => <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", minWidth: "20rem", maxWidth: "60rem" }}>{row.original.detail}</div> },
];

export default function ErrorLogPage() {
  const params = useParams();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [tableKey, setTableKey] = React.useState(0);
  const [state, formAction, isPending] = useActionState(errorLogGetList, {
    error: false,
    message: "",
    data: [],
    pager: { pageIndex: 1, pageSize: 10, pages: 0, records: 0 }
  });

  React.useEffect(() => {
    if (state.error && state.message) toast(state.message);
  }, [state]);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isPending} />
      <Group className="flex w-full">
        <GroupTitle>Error Logs</GroupTitle>
        <GroupContent>
          <form ref={formRef} action={formAction} className="flex flex-col gap-4" onSubmit={(event) => {
            const submitter = (event.nativeEvent as SubmitEvent).submitter;
            if (submitter?.id === "error-log-search" && (state.pager?.pageIndex ?? 1) > 1) {
              event.preventDefault();
              setTableKey((key) => key + 1);
            }
          }}>
            <div className="flex flex-wrap gap-4 items-end">
              <InputWithLabel label="Log ID" labelPosition="top" name="searchId" size="full" />
              <InputWithLabel label="User Name" labelPosition="top" name="searchUserName" size="full" />
              <ButtonCustom id="error-log-search" type="submit">Search</ButtonCustom>
            </div>
            <input type="hidden" name="location" value={String(params.location ?? '')} />
            <DataTable key={tableKey} columns={columns} formState={state} formAction={formAction} formRef={formRef} />
          </form>
        </GroupContent>
      </Group>
    </div>
  );
}