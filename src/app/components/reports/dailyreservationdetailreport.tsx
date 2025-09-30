import { Theme } from "@/core/constants";
import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import React from "react";
import * as XSLX from "xlsx";

export default function DailyReservationDetailReport({ reportRows }: { reportRows: DailyReservationDetailReportRow[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });

    const reportRef = React.useRef(null);

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                <ButtonCustom variant="green" size="sm" className="float-left" onClick={() => {
                    if(reportRef.current){
                        const ws = XSLX.utils.table_to_sheet(reportRef.current);
                        const wb = XSLX.utils.book_new();
                        XSLX.utils.book_append_sheet(wb, ws, "DailyReservationDetailReport");
                        XSLX.writeFile(wb, `DailyReservationDetailReport_${new Date().toISOString().substring(0,10)}.xlsx`);
                    }
                }}>Download Excel</ButtonCustom>
                Daily Reservation Detail Report
            </div>
            <div>
                <table ref={reportRef} className={`w-full text-[10pt]`}>
                    <thead>
                        <tr id="headrow1" className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Rsv Id</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Name</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Pax</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Type</th>
                            <th colSpan={3} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Arrival Date/Time Airline</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Check-In</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Days</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Deposit</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Room</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Club Amount</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Discount</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Club Net Amount</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Single Charge</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Extra Charge</th>
                            <th colSpan={4} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-center`}>Pick Up Fee</th>
                            <th colSpan={4} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-center`}>Drop Off Fee</th>
                        </tr>
                        <tr id="headrow2" className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th colSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Phone</th>
                            <th colSpan={3} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Departure Date/Time Airline</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Check-Out</th>
                            <th colSpan={3} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-center`}>Remark</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>KRW</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>MMK</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>THB</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>USD</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>KRW</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>MMK</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>THB</th>
                            <th className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>USD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}><td className={`p-2 ${Theme.Style.tableCellText}`} colSpan={6}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {

                            return [
                                <tr key={`${rp.reservationId}-row1`} className={`${Theme.Style.tableCellBg}`}>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} max-w-[150px] p-2 text-left`}>{rp.reservationId}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} min-w-[150px] max-w-[150px] p-2 text-left`}>{rp.customerNames}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.noOfGuests}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.reservationType}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.arrivalDateTime.substring(0,10)}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.arrivalDateTime.substring(11,16)}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.arrivalFlight}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.checkInDate.toString().substring(0,10)}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.noOfDays}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.depositAmount}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.roomNo}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.totalAmount}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.discountAmount}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.netAmount}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.singleChargeAmount}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.extraChargeAmount}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.pickUpFeeKWR}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.pickUpFeeMMK}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.pickUpFeeTHB}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.pickUpFeeUSD}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.dropOffFeeKWR}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.dropOffFeeMMK}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.dropOffFeeTHB}</td>
                                    <td rowSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.dropOffFeeUSD}</td>
                                </tr>,
                                <tr key={`${rp.reservationId}-row2`} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellBg}`}>
                                    <td colSpan={2} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.customerPhones}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.departureDateTime.toString().substring(0,10)}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.departureDateTime.toString().substring(11,16)}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.departureFlight}</td>
                                    <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.checkOutDate.toString().substring(0,10)}</td>
                                    <td colSpan={3} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.remark}</td>
                                </tr>
                            ];
                        })}
                    </tbody>
                    {/* <tfoot>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-4 text-right"></th>
                            <th>Total</th>
                            <th className="text-right">{totalGuestCheckIn}</th>
                            <th className="text-right">{totalGuestCheckOut}</th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                        </tr>
                    </tfoot> */}
                </table>
            </div>
        </div>
    );
}