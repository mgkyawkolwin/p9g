import { inject, injectable } from "inversify";
import { TYPES } from "@/core/types";
import type { PagerParams } from "@/core/types";
import type IRepository from "@/lib/repositories/IRepository";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import { CustomError } from "@/lib/errors";
import c from "@/lib/loggers/console/ConsoleLogger";
import { and as dand, count as dcount, desc, eq as deq, like as dlike, lt as dlt, notInArray as dnotInArray, or as dor } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import { TaskClosedStatuses, TaskDepartments, TaskStatuses } from "../constants";
import SessionUser from "../models/dto/SessionUser";
import Task from "../models/domain/Task";
import { customerTable, feedbackTable, reservationTable, taskTable, userTable } from "../orms/drizzle/mysql/schema";
import ITaskService, { TaskListItem, TaskSearchFields } from "./contracts/ITaskService";

@injectable()
export default class TaskService implements ITaskService {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.ITaskRepository) private taskRepository: IRepository<Task>) {

    }


    async createTask(task: Task, sessionUser: SessionUser): Promise<void> {
        c.fs('TaskService > createTask');
        if (!task.description?.trim()) throw new CustomError('Invalid description');
        if (task.department && !(TaskDepartments as readonly string[]).includes(task.department)) throw new CustomError('Invalid department');
        if (task.remark && task.remark.length > 255) throw new CustomError('Remark is too long');
        if (task.reservationId) {
            const [reservation] = await this.dbClient.db.select({ id: reservationTable.id }).from(reservationTable).where(deq(reservationTable.id, task.reservationId));
            if (!reservation) throw new CustomError('Reservation not found');
        }

        const newTask = new Task();
        newTask.reservationId = task.reservationId || null;
        newTask.customerId = task.customerId || null;
        newTask.description = task.description.trim();
        newTask.department = task.department || null;
        newTask.status = 'OPEN';
        newTask.remark = task.remark || null;
        newTask.targetCompletionDateTime = task.targetCompletionDateTime;
        newTask.createdAtUTC = new Date();
        newTask.createdBy = sessionUser.id;
        newTask.updatedAtUTC = new Date();
        newTask.updatedBy = sessionUser.id;

        await this.taskRepository.create(newTask);
        c.fe('TaskService > createTask');
    }


    async createTaskFromFeedback(feedbackId: string, sessionUser: SessionUser): Promise<void> {
        c.fs('TaskService > createTaskFromFeedback');
        if (!feedbackId) throw new CustomError('Invalid feedback id');

        await this.dbClient.db.transaction(async (tx: any) => {
            const [fb] = await tx.select().from(feedbackTable).where(deq(feedbackTable.id, feedbackId));
            if (!fb) throw new CustomError('Feedback not found');
            if (fb.isTaskCreated) throw new CustomError('Task is already created for this feedback');
            if (!fb.feedback?.trim()) throw new CustomError('Feedback is empty');

            const now = new Date();
            await tx.insert(taskTable).values({
                reservationId: fb.reservationId,
                customerId: fb.customerId,
                description: fb.feedback.trim(),
                status: 'OPEN',
                createdAtUTC: now,
                createdBy: sessionUser.id,
                updatedAtUTC: now,
                updatedBy: sessionUser.id
            });
            await tx.update(feedbackTable)
                .set({ isTaskCreated: true, updatedAtUTC: now, updatedBy: sessionUser.id })
                .where(deq(feedbackTable.id, feedbackId));
        });
        c.fe('TaskService > createTaskFromFeedback');
    }


    async taskFindMany(searchFields: TaskSearchFields, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[TaskListItem[], number]> {
        const pageSize = Math.min(Math.max(pagerParams.pageSize ?? 10, 1), 100);
        const offset = (Math.max(pagerParams.pageIndex ?? 1, 1) - 1) * pageSize;

        const isSet = (v?: string) => !!v && v !== 'DEFAULT';
        const customerName = searchFields.searchCustomerName?.trim();
        const conditions = [
            isSet(searchFields.searchReservationId) ? dlike(taskTable.reservationId, `%${searchFields.searchReservationId!.trim()}%`) : undefined,
            customerName ? dor(dlike(customerTable.englishName, `%${customerName}%`), dlike(customerTable.name, `%${customerName}%`)) : undefined,
            isSet(searchFields.searchDepartment) ? deq(taskTable.department, searchFields.searchDepartment!) : undefined,
            isSet(searchFields.searchStatus) ? deq(taskTable.status, searchFields.searchStatus!) : undefined,
            searchFields.searchOverdue === 'OVERDUE' ? dand(dlt(taskTable.targetCompletionDateTime, new Date()), dnotInArray(taskTable.status, [...TaskClosedStatuses])) : undefined,
        ];
        const where = dand(...conditions);

        const [{ total }] = await this.dbClient.db.select({ total: dcount() })
            .from(taskTable)
            .leftJoin(customerTable, deq(customerTable.id, taskTable.customerId))
            .where(where);

        const createdByUser = alias(userTable, 'createdByUser');
        const updatedByUser = alias(userTable, 'updatedByUser');

        const items = await this.dbClient.db.select({
            id: taskTable.id,
            reservationId: taskTable.reservationId,
            customerId: taskTable.customerId,
            customerName: customerTable.englishName,
            customerLocalName: customerTable.name,
            description: taskTable.description,
            department: taskTable.department,
            status: taskTable.status,
            remark: taskTable.remark,
            targetCompletionDateTime: taskTable.targetCompletionDateTime,
            createdAtUTC: taskTable.createdAtUTC,
            createdBy: taskTable.createdBy,
            createdByName: createdByUser.name,
            updatedAtUTC: taskTable.updatedAtUTC,
            updatedBy: taskTable.updatedBy,
            updatedByName: updatedByUser.name
        })
            .from(taskTable)
            .leftJoin(customerTable, deq(customerTable.id, taskTable.customerId))
            .leftJoin(createdByUser, deq(createdByUser.id, taskTable.createdBy))
            .leftJoin(updatedByUser, deq(updatedByUser.id, taskTable.updatedBy))
            .where(where)
            .orderBy(desc(taskTable.createdAtUTC))
            .limit(pageSize)
            .offset(offset);

        return [items, Number(total)];
    }


    async updateTask(id: string, task: Task, sessionUser: SessionUser): Promise<void> {
        c.fs('TaskService > updateTask');
        if (!id) throw new CustomError('Invalid task id');
        if (!task.description?.trim()) throw new CustomError('Description is required');
        if (task.department && !(TaskDepartments as readonly string[]).includes(task.department)) throw new CustomError('Invalid department');
        if (!(TaskStatuses as readonly string[]).includes(task.status)) throw new CustomError('Invalid status');
        if (task.remark && task.remark.length > 255) throw new CustomError('Remark is too long');

        const existing = await this.taskRepository.findById(id);
        if (!existing) throw new CustomError('Task not found');

        existing.description = task.description.trim();
        existing.department = task.department || null;
        existing.status = task.status;
        existing.remark = task.remark || null;
        existing.targetCompletionDateTime = task.targetCompletionDateTime;
        existing.updatedAtUTC = new Date();
        existing.updatedBy = sessionUser.id;

        await this.taskRepository.update(id, existing);
        c.fe('TaskService > updateTask');
    }

}
