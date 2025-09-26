import Reservation from "@/core/models/domain/Reservation";
import RoomCharge from "@/core/models/domain/RoomCharge";
import { Theme } from "@/core/constants";

export default function ReceiptTable({ reservation, roomCharges }: { reservation: Reservation, roomCharges: RoomCharge[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });
    return (
        <div className="flex flex-col w-full gap-4">
            <div className="flex flex-row place-content-between items-end">
                <div className="text-[18pt] font-bold">RECEIPT</div>
            </div>
            <div className="text-[12pt]">
                Customer: {reservation.customers?.reduce((acc, c) => acc + (acc ? ", " : "") + (c.englishName && c.englishName?.trim() !== "" ? c.englishName : c.name), "")}
            </div>
            <div>
                <table className={`w-full text-[10pt]`}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>
                            <th>Description</th>
                            <th className="text-right">Start</th>
                            <th className="text-right">End</th>
                            <th className="text-right">Rate</th>
                            <th className="w-[100px]">Pax</th>
                            <th className="w-[100px]">Days</th>
                            <th className="w-[150px] p-2">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomCharges?.length === 0 ? <tr className={`border p-8 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}><td className="p-2" colSpan={7}>&nbsp;</td></tr> : ""}
                        {roomCharges.map((charge: RoomCharge, index) => {
                            const charges = [];
                            const roomRate = reservation.prepaidPackageId ? charge.seasonSurcharge : charge.roomRate;

                            charges.push(<tr key={`${index}-room`} className={`border p-8 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className="p-2">Room Charge - {charge.roomNo}</td>
                                <td className="text-right">{charge.startDate.toISOFormatDateString()}</td>
                                <td className="text-right">{charge.endDate.toISOFormatDateString()}</td>
                                <td className="text-right">{formatter.format(roomRate)}</td>
                                <td className="p-2 text-center">{reservation.noOfGuests}</td>
                                <td className="text-center">{charge.noOfDays}</td>
                                <td className="text-right p-1 p-2">{formatter.format(charge.noOfDays * reservation.noOfGuests * roomRate)}</td>
                            </tr>);

                            if (charge.singleRate > 0) {
                                charges.push(<tr key={`${index}-single`} className={`border p-8 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                    <td className="p-2">Single Charge - {charge.roomNo}</td>
                                    <td className="text-right">{charge.startDate.toISOFormatDateString()}</td>
                                    <td className="text-right">{charge.endDate.toISOFormatDateString()}</td>
                                    <td className="text-right">{formatter.format(charge.singleRate)}</td>
                                    <td className="p-2 text-center">{reservation.noOfGuests}</td>
                                    <td className="text-center">{charge.noOfDays}</td>
                                    <td className="text-right p-1 p-2">{formatter.format(charge.noOfDays * charge.singleRate)}</td>
                                </tr>);
                            }

                            if (charge.roomSurcharge > 0) {
                                charges.push(<tr key={`${index}-extra`} className={`border p-8 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                    <td className="p-2">Room Extra Charge - {charge.roomNo}</td>
                                    <td className="text-right">{charge.startDate.toISOFormatDateString()}</td>
                                    <td className="text-right">{charge.endDate.toISOFormatDateString()}</td>
                                    <td className="text-right">{formatter.format(charge.roomSurcharge)}</td>
                                    <td className="p-2 text-center">{reservation.noOfGuests}</td>
                                    <td className="text-center">{charge.noOfDays}</td>
                                    <td className="text-right p-1 p-2">{formatter.format(charge.noOfDays * charge.roomSurcharge)}</td>
                                </tr>);
                            }

                            return charges;
                        })}

                        {reservation?.bills?.map((bill, index) => {

                            let description = "";
                            if (bill.paymentType === 'PICKUP' || bill.paymentType === 'DROPOFF') {
                                description += (description.length > 0 ? ', ' : ' ') + bill.paymentType + ' - ' + (Number(bill.amount ?? 0) * Number(bill.quantity ?? 0)) + ' ' + bill.currency;
                                return <tr key={Math.random()} className={`border p-8 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                    <td className="p-2">
                                        {reservation?.bills?.map((bill, index) => {

                                            let description = "";
                                            if (bill.paymentType === 'PICKUP' || bill.paymentType === 'DROPOFF') {
                                                description += (description.length > 0 ? ', ' : ' ') + bill.paymentType + ' - ' + (Number(bill.amount ?? 0) * Number(bill.quantity ?? 0)) + ' ' + bill.currency;
                                            }

                                            return description;
                                        })}
                                    </td>
                                    <td className="p-2"></td>
                                    <td className="p-2"></td>
                                    <td className="text-right"></td>
                                    <td className="p-2 text-center"></td>
                                    <td className="text-center"></td>
                                    <td className="text-right p-1 p-2"></td>
                                </tr>;
                            }


                        })}


                    </tbody>
                    <tfoot>
                        <tr>
                            <td rowSpan={7} colSpan={5}></td>
                            <td className="text-right p-2">Total</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.totalAmount)}</td>
                        </tr>
                        <tr>
                            <td className="text-right p-2">Deposit</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.depositAmount)}</td>
                        </tr>
                        <tr>
                            <td className="text-right p-2">Discount</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.discountAmount)}</td>
                        </tr>
                        <tr>
                            <td className="text-right p-2">Tax ({reservation.tax})%</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.taxAmount)}</td>
                        </tr>
                        <tr>
                            <td className="text-right p-2">Net Total</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.netAmount)}</td>
                        </tr>
                        <tr>
                            <td className="text-right p-2">Paid</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.paidAmount)}</td>
                        </tr>
                        <tr>
                            <td className="text-right p-2">Due Amount</td>
                            <td className={`border-1 text-right p-2 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{formatter.format(reservation.dueAmount)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}