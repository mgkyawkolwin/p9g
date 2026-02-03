import DailySummaryPersonReportRow from "@/core/models/dto/reports/DailySummaryPersonReportRow";
import { Theme } from "@/core/constants";
import ExcelJS from "exceljs";
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

    const downloadExcel = async () => {
        if (!reportRef.current) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("DailySummaryPersonReport");

        const table = reportRef.current as HTMLTableElement;
        const headerCells = table.querySelectorAll("thead th");
        const headerValues: (string | null)[] = [];
        headerCells.forEach((cell) => {
            headerValues.push(cell.textContent?.trim() || null);
        });
        worksheet.addRow(headerValues.filter(v => v !== null));

        const dataRows = table.querySelectorAll("tbody tr");
        dataRows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            const rowValues: (string | null)[] = [];
            cells.forEach((cell) => {
                rowValues.push(cell.textContent?.trim() || null);
            });
            if (rowValues.some(v => v !== null)) {
                worksheet.addRow(rowValues.filter(v => v !== null));
            }
        });

        const footerRows = table.querySelectorAll("tfoot tr");
        footerRows.forEach((row) => {
            const cells = row.querySelectorAll("th");
            const rowValues: (string | null)[] = [];
            cells.forEach((cell) => {
                rowValues.push(cell.textContent?.trim() || null);
            });
            if (rowValues.some(v => v !== null)) {
                worksheet.addRow(rowValues.filter(v => v !== null));
            }
        });

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD3D3D3" } };

        worksheet.columns.forEach((column) => {
            let maxLength = 10;
            if (column.eachCell) {
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const cellLength = cell.value ? String(cell.value).length : 0;
                    if (cellLength > maxLength) {
                        maxLength = cellLength;
                    }
                });
            }
            column.width = Math.min(maxLength + 2, 50);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DailySummaryPersonReport_${new Date().toISOString().substring(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                <ButtonCustom variant="green" size="sm" className="float-left" onClick={downloadExcel}>Download Excel</ButtonCustom>
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