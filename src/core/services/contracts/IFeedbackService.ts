import Feedback from "@/core/models/domain/Feedback";
import Room from "@/core/models/domain/Room";
import SessionUser from "@/core/models/dto/SessionUser";


export default interface IFeedbackService {

    createFeedback(feedback: Feedback, sessionUser: SessionUser): Promise<void>;
    findFeedbacksByReservationCustomer(reservationId: string, customerId: string, pageIndex: number, pageSize: number): Promise<[Feedback[], number]>;
    deleteFeedback(id: string, sessionUser: SessionUser): Promise<void>;
    findFeedbacksByCustomerId(customerId: string, pageIndex: number, pageSize: number): Promise<[CustomerFeedbackItem[], number]>;

}

export interface CustomerFeedbackItem {
    id: string;
    reservationId: string;
    reservationType: string | null;
    checkInDate: Date | null;
    checkOutDate: Date | null;
    location: string;
    feedback: string | null;
}