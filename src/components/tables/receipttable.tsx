import Payment from "@/domain/models/Payment";
import Reservation from "@/domain/models/Reservation";
import RoomCharge from "@/domain/models/RoomCharge";

export default function ReceiptTable({reservation, roomCharges} : {reservation: Reservation, roomCharges: RoomCharge[]}){
    const formatter = new Intl.NumberFormat('en-US',{
        style:"decimal"
    });
    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                RECEIPT
            </div>
            <div>
                <table className="w-full text-[10pt]">
                    <thead>
                        <tr className="bg-[#ccc] border-1 border-[#999]">
                            <th className="p-2">No</th>
                            <th>Description</th>
                            <th className="text-right">Rate</th>
                            <th className="w-[100px]">Days</th>
                            <th className="w-[150px]">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomCharges?.length === 0 && <tr><td></td><td></td><td></td><td></td><td></td></tr>}
                        {roomCharges.map((charge, index) => {
                            let rate ;
                            if(reservation.prepaidPackageId){
                                rate = 'Prepaid';
                            }else{
                                rate = formatter.format(charge.roomRate);
                            }

                            let description = <div>
                                Room - {charge.roomNo} ( {charge.roomTypeText} ), Rate - 
                                {reservation.prepaidPackageId ? ' Prepaid' : ' ' + formatter.format(charge.roomRate)} 
                                
                                <br/>
                                {charge.roomSurcharge > 0 ? <span>Room Surcharge: {formatter.format(charge.roomSurcharge)}<br/></span> : ''}
                                {reservation.prepaidPackageId && charge.seasonSurcharge > 0 ? <span>Season Surcharge: {formatter.format(charge.seasonSurcharge)}<br/></span> : ''}
                                {charge.singleRate > 0 ? <span>Single Charge: {formatter.format(charge.singleRate)}<br/></span> : ''}
                                
                                ( {charge.startDateUTC.toLocaleDateString('sv-SE')} - {charge.endDateUTC.toLocaleDateString('sv-SE')} )
                            </div>;

                            return <tr key={index} className="bg-[#eee] border-1 border-[#999] p-8">
                                <td className="p-2">{index+1}</td>
                                <td className="p-2">{description}</td>
                                <td className="text-right">{formatter.format(charge.totalRate)}</td>
                                <td className="text-center">{charge.noOfDays}</td>
                                <td className="text-right p-1 p-2">{formatter.format(charge.totalAmount)}</td>
                            </tr>;
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Total</td>
                            <td className="border-1 border-[#999] text-right p-2">{formatter.format(reservation.totalAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Discount</td>
                            <td className="border-1 border-[#999] text-right p-2">{formatter.format(reservation.discountAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Tax ({reservation.tax})%</td>
                            <td className="border-1 border-[#999] text-right p-2">{formatter.format(reservation.taxAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Net Total</td>
                            <td className="border-1 border-[#999] text-right p-2">{formatter.format(reservation.netAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Paid</td>
                            <td className="border-1 border-[#999] text-right p-2">{formatter.format(reservation.paidAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Due Amount</td>
                            <td className="border-1 border-[#999] text-right p-2">{formatter.format(reservation.dueAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}