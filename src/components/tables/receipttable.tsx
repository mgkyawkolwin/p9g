import Payment from "@/domain/models/Payment";
import Reservation from "@/domain/models/Reservation";
import RoomCharge from "@/domain/models/RoomCharge";

export default function ReceiptTable({reservation, roomCharges} : {reservation: Reservation, roomCharges: RoomCharge[]}){

    return (
        <div className="flex flex-col">
            <div>
                RECEIPT
            </div>
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Description</th>
                            <th>Rate</th>
                            <th>Days</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomCharges.map((charge, index) => {
                            let description = charge.roomType;

                            if(reservation.prepaidPackageId){
                                description = description + '\n' + 'Rate - FOC';
                            }else{
                                description = description + '\n' + 'Rate - ' + charge.roomRate;
                            }

                            if(charge.roomSurcharge > 0){
                                description = description +'\n Room Surcharge - '+ charge.roomSurcharge;
                            }

                            if(charge.seasonSurcharge > 0){
                                description = description +'\n Season Surcharge - '+ charge.seasonSurcharge;
                            }

                            if(charge.singleRate > 0){
                                description = description +'\n Single Rate - '+ charge.singleRate;
                            }

                            return <tr>
                                <td>{index+1}</td>
                                <td>{description}</td>
                                <td>{charge.totalRate}</td>
                                <td>{charge.noOfDays}</td>
                                <td>{charge.totalAmount}</td>
                            </tr>;
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Total</td>
                            <td>{reservation.totalAmount}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Discount</td>
                            <td>{reservation.discountAmount}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Tax ({reservation.tax})%</td>
                            <td>{reservation.taxAmount}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Net Total</td>
                            <td>{reservation.totalAmount}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Paid</td>
                            <td>{reservation.paidAmount}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>Balance</td>
                            <td>{reservation.balanceAmount}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}