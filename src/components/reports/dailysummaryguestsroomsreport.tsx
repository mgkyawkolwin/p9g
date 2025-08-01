import DailySummaryGuestsRoomsReportRow from "@/domain/dtos/reports/DailySummaryGuestsRoomsReportrow";

export default function DailySummaryGuestsRoomsReport({reportRows} : {reportRows: DailySummaryGuestsRoomsReportRow[]}){
    const formatter = new Intl.NumberFormat('en-US',{
        style:"decimal"
    });

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                Daily Summary Report (Guests & Rooms)
            </div>
            <div>
                <table className="w-full text-[10pt]">
                    <thead>
                        <tr className="bg-[#ccc] border-1 border-[#999]">
                            <th className="p-2">No</th>
                            <th>Date</th>
                            <th className="">Guests Check-In</th>
                            <th className="">Guests Check-Out</th>
                            <th className="">Guests Existing</th>
                            <th className="">Guests Total</th>
                            <th className="">Rooms Total</th>
                            <th className="">Rooms Check-In</th>
                            <th className="">Rooms Check-Out</th>
                            <th className="">Rooms Existing</th>
                            <th className="">Rooms Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr><td colSpan={6}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {
                            return <tr key={index} className="bg-[#eee] border-1 border-[#999] p-8">
                                <td className="p-2">{index+1}</td>
                                <td className="p-2">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                <td className="text-right">{rp.guestsCheckIn}</td>
                                <td className="p-2 text-center">{rp.guestsCheckOut}</td>
                                <td className="text-center">{rp.guestsExisting}</td>
                                <td className="text-center">{rp.guestsTotal}</td>
                                <td className="p-1 p-2">{rp.roomsTotal}</td>
                                <td className="p-1 p-2">{rp.roomsCheckIn}</td>
                                <td className="p-1 p-2">{rp.roomsCheckOut}</td>
                                <td className="p-1 p-2">{rp.roomsExisting}</td>
                                <td className="p-1 p-2">{rp.roomsAvailable}</td>
                            </tr>;
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}