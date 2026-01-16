import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import { Theme } from "@/core/constants";
import * as XSLX from "xlsx";
import React from "react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";

export default function DailySummaryPersonReport({ reportRows }: { reportRows: DailySummaryPersonReportRow[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });

    let totalGuestCheckIn = 0;
    let totalGuestCheckOut = 0;
    let totalGuestTotal = 0;
    let totalReservationTotal = 0;
    let totalRoomsTotal = 0;
    const reportRef = React.useRef(null);

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                <ButtonCustom variant="green" size="sm" className="float-left" onClick={() => {
                    if(reportRef.current){
                        const ws = XSLX.utils.table_to_sheet(reportRef.current);
                        const wb = XSLX.utils.book_new();
                        XSLX.utils.book_append_sheet(wb, ws, "DailySummaryPersonReport");
                        XSLX.writeFile(wb, `DailySummaryPersonReport_${new Date().toISOString().substring(0,10)}.xlsx`);
                    }
                }}>Download Excel</ButtonCustom>
                Daily Summary Report (Person)
            </div>
            <div>
                <table ref={reportRef} className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-2 text-right">No</th>
                            <th className="text-right">Date</th>
                            <th className="text-right">Guests Check-In</th>
                            <th className="text-right">Guests Check-Out</th>
                            <th className="text-right">Guests Total</th>
                            <th className="p-2 text-right">Reservation Total</th>
                            <th className="p-2 text-right">Rooms Total (Reserved)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}><td className={`p-2 ${Theme.Style.tableCellText}`} colSpan={6}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {
                            totalGuestCheckIn = totalGuestCheckIn + Number(rp.guestsCheckIn);
                            totalGuestCheckOut = totalGuestCheckOut + Number(rp.guestsCheckOut);
                            totalGuestTotal = totalGuestTotal + Number(rp.guestsTotal);
                            totalReservationTotal = totalReservationTotal + Number(rp.reservationTotal);
                            totalRoomsTotal = totalRoomsTotal + Number(rp.roomsTotal);

                            return <tr key={index} className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className="p-2 text-right">{index + 1}</td>
                                <td className="text-right">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                <td className="text-right">{rp.guestsCheckIn}</td>
                                <td className="text-right">{rp.guestsCheckOut}</td>
                                <td className="text-right">{rp.guestsTotal}</td>
                                <td className="p-2 text-right">{rp.reservationTotal}</td>
                                <td className="p-2 text-right">{rp.roomsTotal}</td>
                            </tr>;
                        })}
                    </tbody>
                    <tfoot>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-4 text-right"></th>
                            <th>Total</th>
                            <th className="text-right">{totalGuestCheckIn}</th>
                            <th className="text-right">{totalGuestCheckOut}</th>
                            <th className="text-right">{totalGuestTotal}</th>
                            <th className="text-right">{totalReservationTotal}</th>
                            <th className="p-2 text-right">{totalRoomsTotal}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}