import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import { Theme } from "@/core/constants";

export default function DailySummaryPersonReport({ reportRows }: { reportRows: DailySummaryPersonReportRow[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });

    let totalGuestCheckIn = 0;
    let totalGuestCheckOut = 0;

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                Daily Summary Report (Person)
            </div>
            <div>
                <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-2 text-right">No</th>
                            <th className="text-right">Date</th>
                            <th className="text-right">Guests Check-In</th>
                            <th className="text-right">Guests Check-Out</th>
                            <th className="text-right">Guests Total</th>
                            <th className="p-2 text-right">Reservation Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr><td className={`${Theme.Style.tableCellText}`} colSpan={6}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {
                            totalGuestCheckIn = totalGuestCheckIn + Number(rp.guestsCheckIn);
                            totalGuestCheckOut = totalGuestCheckOut + Number(rp.guestsCheckOut);

                            return <tr key={index} className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className="p-2 text-right">{index + 1}</td>
                                <td className="text-right">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                <td className="text-right">{rp.guestsCheckIn}</td>
                                <td className="text-right">{rp.guestsCheckOut}</td>
                                <td className="text-right">{rp.guestsTotal}</td>
                                <td className="p-2 text-right">{rp.reservationTotal}</td>
                            </tr>;
                        })}
                    </tbody>
                    <tfoot>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-4 text-right"></th>
                            <th>Total</th>
                            <th className="text-right">{totalGuestCheckIn}</th>
                            <th className="text-right">{totalGuestCheckOut}</th>
                            <th className=""></th>
                            <th className=""></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}