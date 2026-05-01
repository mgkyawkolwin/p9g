import DailySummaryZoneGuestsReportRow from "@/core/models/dto/reports/DailySummaryZoneGuestsReportRow";
import { Theme } from "@/core/constants";
import ExcelJS from "exceljs";
import React from "react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";

export default function DailySummaryZoneGuestsReport({ reportRows }: { reportRows: DailySummaryZoneGuestsReportRow[] }) {
    let totalGuestCheckIn = 0;
    let totalGuestCheckOut = 0;
    let totalGuestTotal = 0;
    let totalReservationTotal = 0;
    let totalRoomsTotal = 0;
    const reportRef = React.useRef(null);

    const isNumericValue = (value: any): boolean => {
        if (value === null || value === undefined || value === '') {
            return false;
        }

        const stringValue = String(value);
        const withoutCommas = stringValue.replace(/,/g, '');
        return !isNaN(parseFloat(withoutCommas)) && isFinite(parseFloat(withoutCommas));
    };

    const downloadExcel = async () => {
        if (!reportRef.current) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("DailySummaryZoneGuestsReport");
        const table = reportRef.current as HTMLTableElement;

        const processRow = (row: HTMLTableRowElement, rowIndex: number, isHeader: boolean, isFooter: boolean = false) => {
            const cells = row.querySelectorAll("th, td");
            const rowValues: any[] = [];
            const colspans: number[] = [];

            cells.forEach((cell) => {
                const cellElement = cell as HTMLTableCellElement;
                const text = cellElement.textContent?.trim() || "";
                const colspan = cellElement.colSpan || 1;
                rowValues.push(text);
                colspans.push(colspan);
                for (let i = 1; i < colspan; i++) {
                    rowValues.push(null);
                }
            });

            const excelRow = worksheet.addRow(rowValues);
            let colIndex = 1;

            cells.forEach((cell, cellIndex) => {
                const cellElement = cell as HTMLTableCellElement;
                const text = cellElement.textContent?.trim() || "";
                const colspan = colspans[cellIndex];
                const excelCell = excelRow.getCell(colIndex);

                if (isHeader) {
                    excelCell.font = { bold: true };
                    excelCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFD3D3D3" }
                    };
                    excelCell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else if (isFooter) {
                    excelCell.font = { bold: true };
                    excelCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFE6E6E6" }
                    };
                    if (isNumericValue(text)) {
                        excelCell.alignment = { horizontal: 'right' };
                    } else {
                        excelCell.alignment = { horizontal: 'left' };
                    }
                } else {
                    excelCell.alignment = isNumericValue(text) ? { horizontal: 'right' } : { horizontal: 'left' };
                }

                excelCell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                if (colspan > 1) {
                    worksheet.mergeCells(
                        rowIndex,
                        colIndex,
                        rowIndex,
                        colIndex + colspan - 1
                    );
                    for (let i = 1; i < colspan; i++) {
                        const mergedCell = excelRow.getCell(colIndex + i);
                        mergedCell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    }
                }

                colIndex += colspan;
            });
        };

        const headerRows = table.querySelectorAll("thead tr");
        headerRows.forEach((headerRow, index) => {
            processRow(headerRow as HTMLTableRowElement, index + 1, true);
        });

        const dataRows = table.querySelectorAll("tbody tr");
        let dataRowIndex = headerRows.length + 1;
        dataRows.forEach((row) => {
            processRow(row as HTMLTableRowElement, dataRowIndex, false);
            dataRowIndex++;
        });

        const footerRows = table.querySelectorAll("tfoot tr");
        footerRows.forEach((row) => {
            processRow(row as HTMLTableRowElement, dataRowIndex, false, true);
            dataRowIndex++;
        });

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
            column.width = Math.min(maxLength + 2, 30);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `DailySummaryZoneGuestsReport_${new Date().toISOString().substring(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                <ButtonCustom variant="green" size="sm" className="float-left" onClick={downloadExcel}>Download Excel</ButtonCustom>
                Daily Summary Report (Check-In Guests By Zone)
            </div>
            <div>
                <table ref={reportRef} className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-2 text-right">No</th>
                            <th className="text-left">Date</th>
                            <th className="text-left">Zone</th>
                            <th className="text-right">Guests Check-In</th>
                            <th className="text-right">Guests Check-Out</th>
                            <th className="text-right">Guests Total</th>
                            <th className="p-2 text-right">Reservation Total</th>
                            <th className="p-2 text-right">Rooms Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}><td className={`p-2 ${Theme.Style.tableCellText}`} colSpan={8}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {
                            totalGuestCheckIn += Number(rp.guestsCheckIn);
                            totalGuestCheckOut += Number(rp.guestsCheckOut);
                            totalGuestTotal += Number(rp.guestsTotal);
                            totalReservationTotal += Number(rp.reservationTotal);
                            totalRoomsTotal += Number(rp.roomsTotal);

                            return <tr key={index} className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className="p-2 text-right">{index + 1}</td>
                                <td className="text-left">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                <td className="text-left">{rp.zone}</td>
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
                            <th className="text-left"></th>
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
