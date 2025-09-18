import Payment from "@/core/models/domain/Payment";
import Reservation from "@/core/models/domain/Reservation";
import RoomCharge from "@/core/models/domain/RoomCharge";
import { Theme } from "@/core/constants";

export default function ReceiptTable({ reservation, roomCharges }: { reservation: Reservation, roomCharges: RoomCharge[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });
    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                RECEIPT
            </div>
            <div className="text-[12pt]">
                Customer: {reservation.customers?.reduce((acc, c) => acc + (acc ? ", " : "") + c.name, "")}
            </div>
            <div>
                <table className={`w-full text-[10pt]`}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>
                            <th className="p-2">No</th>
                            <th>Description</th>
                            <th className="text-right">Rate</th>
                            <th className="w-[100px]">Pax</th>
                            <th className="w-[100px]">Days</th>
                            <th className="w-[150px]">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {roomCharges?.length === 0 && <tr><td colSpan={6}>No Data</td></tr>} */}
                        {roomCharges.map((charge:RoomCharge, index) => {
                            let rate;
                            if (reservation.prepaidPackageId) {
                                rate = 'Prepaid';
                            } else {
                                rate = formatter.format(charge.roomRate);
                            }

                            const description = <div>
                                Room - {charge.roomNo} ( {charge.roomTypeText} ), Rate -
                                {reservation.prepaidPackageId ? ' Prepaid' : ' ' + formatter.format(charge.roomRate)}

                                <br />
                                {charge.roomSurcharge > 0 ? <span>Room Surcharge: {formatter.format(charge.roomSurcharge)}<br /></span> : ''}
                                {reservation.prepaidPackageId && charge.seasonSurcharge > 0 ? <span>Season Surcharge: {formatter.format(charge.seasonSurcharge)}<br /></span> : ''}
                                {charge.singleRate > 0 ? <span>Single Charge: {formatter.format(charge.singleRate)}<br /></span> : ''}

                                ( {charge.startDate.toISODateString()} - {charge.endDate.toISODateString()} )
                            </div>;

                            return <tr key={index} className={`border p-8 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2">{description}</td>
                                <td className="text-right">{formatter.format(charge.totalRate)}</td>
                                <td className="p-2 text-center">{reservation.noOfGuests}</td>
                                <td className="text-center">{charge.noOfDays}</td>
                                <td className="text-right p-1 p-2">{formatter.format(charge.totalAmount)}</td>
                            </tr>;
                        })}
                        <tr key={Math.random()} className={`border p-8 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                            <td className="p-2"></td>
                            <td className="p-2">
                                {reservation?.bills?.map((bill, index) => {

                                    let description = "";
                                    if (bill.paymentType === 'PICKUP' || bill.paymentType === 'DROPOFF') {
                                        description +=  (description.length > 0 ? ', ' : ' ') + bill.paymentType + ' - ' + (Number(bill.amount ?? 0) * Number(bill.quantity ?? 0)) + ' ' + bill.currency;
                                    }

                                    return description;
                                })}
                            </td>
                            <td className="text-right"></td>
                            <td className="p-2 text-center"></td>
                            <td className="text-center"></td>
                            <td className="text-right p-1 p-2"></td>
                        </tr>


                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Total</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.totalAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Deposit</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.depositAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Discount</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.discountAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Tax ({reservation.tax})%</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.taxAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Net Total</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.netAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Paid</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.paidAmount)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-right p-2">Due Amount</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.dueAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}