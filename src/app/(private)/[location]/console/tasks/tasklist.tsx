"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { taskGetList } from "./actions";
import React from "react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import TaskListTable from "@/app/components/tables/tasklisttable";
import TaskSearch from "@/app/components/searchs/tasksearch";
import { useParams } from 'next/navigation';

export default function TaskList() {
  const params = useParams();
  const location = params.location as string;

  const formRef = React.useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(taskGetList, {
    error: false,
    message: ""
  });

  useEffect(() => {
    if (state.message) {
      toast(state.message);
    }
  }, [state]);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isPending} />
      <Group className="flex w-full">
        <GroupTitle>
          Tasks
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <TaskSearch formRef={formRef} />
              <TaskListTable formState={state} formAction={formAction} formRef={formRef} />
              <input type="hidden" name="location" value={location} />
            </form>
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}
