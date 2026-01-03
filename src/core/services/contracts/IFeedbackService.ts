import Feedback from "@/core/models/domain/Feedback";
import Room from "@/core/models/domain/Room";
import SessionUser from "@/core/models/dto/SessionUser";


export default interface IFeedbackService {

    createOrUpdateFeedback(feedback: Feedback, sessionUser: SessionUser): Promise<void>;

}