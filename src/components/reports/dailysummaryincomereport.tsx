import DailySummaryIncomeReportRow from "@/domain/dtos/reports/DailySummaryIncomeReportRow";

export default function DailySummaryIncomeReport({reportRows} : {reportRows: DailySummaryIncomeReportRow[]}){
    const formatter = new Intl.NumberFormat('en-US',{
        style:"decimal"
    });

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                Daily Summary Report (Income)
            </div>
            <div>
                <table className="w-full text-[10pt] border-[#999]">
                    <thead className="border-[#999]">
                        <tr key={`headrow-${Math.random()}`} className="bg-[#ccc] border-1 border-[#999]">
                            <th key={`headcell-${Math.random()}`} className="border-1 border-[#999]" colSpan={9}>Room Payment Summary</th>
                            <th key={`headcell-${Math.random()}`} className="border-1 border-[#999]" colSpan={8}>Deposit</th>
                            <th key={`headcell-${Math.random()}`} className="border-1 border-[#999]" colSpan={8}>Room Payment</th>
                            <th key={`headcell-${Math.random()}`} className="border-1 border-[#999]" colSpan={8}>Pick Up</th>
                            <th key={`headcell-${Math.random()}`} className="border-1 border-[#999]" colSpan={8}>Drop Off</th>
                            <th key={`headcell-${Math.random()}`} className="border-1 border-[#999]" colSpan={8}>Bill</th>
                            <th key={`headcell-${Math.random()}`} className="border-1 border-[#999]" colSpan={8}>Total</th>
                            <th key={`headcell-${Math.random()}`} className="border-1 border-[#999]" colSpan={4}>Total</th>
                        </tr>
                        <tr key={`headrow-${Math.random()}`} className="bg-[#ccc] border-1 border-[#999]">
                            <th colSpan={9} className="border-r-1 border-[#999]"></th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Bank</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Cash</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Bank</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Cash</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Bank</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Cash</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Bank</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Cash</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Bank</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Cash</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Bank</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Cash</th>
                            <th colSpan={4} className="border-r-1 border-[#999]">Bank/Cash</th>
                        </tr>
                        <tr key={`headrow-${Math.random()}`} className="bg-[#ccc] border-1 border-[#999]">
                            <th key={`headcell-${Math.random()}`} className="p-2">No</th>
                            <th key={`headcell-${Math.random()}`}>Date</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Tot Rsv</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Room Charge</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Deposit</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Tax</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Paid</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Discount</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">Due</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1 border-r-1 border-[#999]">USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">USD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr><td colSpan={6}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {
                            return <tr key={index} className="bg-[#eee] border-1 border-[#999] p-8">
                                <td className="p-2">{index+1}</td>
                                <td className="p-2">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalCheckInReservations)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomCharge)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDeposit)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalTaxAmount)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDiscount)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPaid)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalDue)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalDepositBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDepositBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDepositBankTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalDepositBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalDepositCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDepositCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDepositCashTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalDepositCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeBankTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalRoomChargeBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeCashTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalRoomChargeCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpBankTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalPickUpBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpCashTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalPickUpCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffBankTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalDropOffBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffCashTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalDropOffCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalBillBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBillBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBillBankTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalBillBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalBillCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBillCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBillCashTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalBillCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBankTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalCashTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalTHB)}</td>
                                <td className="p-2 border-r-1 border-[#999] text-right">{formatter.format(rp.totalUSD)}</td>
                            </tr>;
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}