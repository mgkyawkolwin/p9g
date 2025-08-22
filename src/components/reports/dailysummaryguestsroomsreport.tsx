import DailySummaryGuestsRoomsReportRow from "@/domain/dtos/reports/DailySummaryGuestsRoomsReportrow";
import { Theme } from "@/lib/constants";

export default function DailySummaryGuestsRoomsReport({ reportRows }: { reportRows: DailySummaryGuestsRoomsReportRow[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });

    let totalGuestCheckIn = 0;
    let totalGuestCheckOut = 0;
    let totalRoomCheckIn = 0;
    let totalRoomCheckOut = 0;

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                Daily Summary Report (Guests & Rooms)
            </div>
            <div>
                <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-2">No</th>
                            <th>Date</th>
                            <th className="text-right">Guests Check-In</th>
                            <th className="text-right">Guests Check-Out</th>
                            <th className="text-right">Guests Existing</th>
                            <th className="text-right">Guests Total</th>
                            <th className="text-right">Rooms Total</th>
                            <th className="text-right">Rooms Check-In</th>
                            <th className="text-right">Rooms Check-Out</th>
                            <th className="text-right">Rooms Existing</th>
                            <th className="p-2 text-right">Rooms Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr><td className={`${Theme.Style.tableCellText}`} colSpan={6}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {
                            totalGuestCheckIn = totalGuestCheckIn + Number(rp.guestsCheckIn);
                            totalGuestCheckOut = totalGuestCheckOut + Number(rp.guestsCheckOut);
                            totalRoomCheckIn = totalRoomCheckIn + Number(rp.roomsCheckIn);
                            totalRoomCheckOut = totalRoomCheckOut + Number(rp.roomsCheckOut);

                            return <tr key={index} className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className="p-2">{index + 1}</td>
                                <td className="">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                <td className="text-right">{rp.guestsCheckIn}</td>
                                <td className="text-right">{rp.guestsCheckOut}</td>
                                <td className="text-right">{rp.guestsExisting}</td>
                                <td className="text-right">{rp.guestsTotal}</td>
                                <td className="text-right">{rp.roomsTotal}</td>
                                <td className="text-right">{rp.roomsCheckIn}</td>
                                <td className="text-right">{rp.roomsCheckOut}</td>
                                <td className="text-right">{rp.roomsExisting}</td>
                                <td className="p-2 text-right">{rp.roomsAvailable}</td>
                            </tr>;
                        })}
                    </tbody>
                    <tfoot>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-4"></th>
                            <th>Total</th>
                            <th className="text-right">{totalGuestCheckIn}</th>
                            <th className="text-right">{totalGuestCheckOut}</th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className=""></th>
                            <th className="text-right">{totalRoomCheckIn}</th>
                            <th className="text-right">{totalRoomCheckOut}</th>
                            <th className=""></th>
                            <th className=""></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}