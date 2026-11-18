import Task from "@/core/models/domain/Task";
import SessionUser from "@/core/models/dto/SessionUser";
import { PagerParams } from "@/core/types";

export interface TaskSearchFields {
    searchReservationId?: string;
    searchCustomerName?: string;
    searchDepartment?: string;
    searchStatus?: string;
    searchOverdue?: string;
}

export interface TaskListItem {
    id: string;
    reservationId: string | null;
    customerId: string | null;
    customerName: string | null;
    customerLocalName: string | null;
    description: string;
    department: string | null;
    status: string;
    remark: string | null;
    targetCompletionDateTime: Date | null;
    createdAtUTC: Date;
    createdBy: string;
    createdByName: string | null;
    updatedAtUTC: Date;
    updatedBy: string;
    updatedByName: string | null;
}

export default interface ITaskService {

    createTask(task: Task, sessionUser: SessionUser): Promise<void>;
    createTaskFromFeedback(feedbackId: string, sessionUser: SessionUser): Promise<void>;
    updateTask(id: string, task: Task, sessionUser: SessionUser): Promise<void>;
    taskFindMany(searchFields: TaskSearchFields, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[TaskListItem[], number]>;

}
