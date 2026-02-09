import DailySummaryGuestsRoomsReportRow from "@/core/models/dto/reports/DailySummaryGuestsRoomsReportrow";
import { Theme } from "@/core/constants";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import React from "react";
import ExcelJS from "exceljs";

export default function DailySummaryGuestsRoomsReport({ reportRows }: { reportRows: DailySummaryGuestsRoomsReportRow[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });

    let totalGuestCheckIn = 0;
    let totalGuestCheckOut = 0;
    let totalRoomCheckIn = 0;
    let totalRoomCheckOut = 0;
    let totalGuestExisting = 0;
    let totalGuestTotal = 0;
    let totalRoomTotal = 0;
    let totalRoomExisting = 0;
    let totalRoomAvailable = 0;
    const reportRef = React.useRef(null);

    const downloadExcel = async () => {
        if (!reportRef.current) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("DailySummaryIncomeReport");

        const table = reportRef.current as HTMLTableElement;

        // Helper function to check if a value is numeric
        const isNumericValue = (value: any): boolean => {
            if (value === null || value === undefined || value === '') {
                return false;
            }

            const stringValue = String(value);
            // Remove commas for number checking
            const withoutCommas = stringValue.replace(/,/g, '');

            // Check if it's a valid number (including decimal numbers)
            return !isNaN(parseFloat(withoutCommas)) && isFinite(parseFloat(withoutCommas));
        };

        // Helper function to process any row
        const processRow = (row: HTMLTableRowElement, rowIndex: number, isHeader: boolean, isFooter: boolean = false) => {
            const cells = row.querySelectorAll("th, td");
            const rowValues: any[] = [];
            const colspans: number[] = [];

            // First pass: collect values and colspan info
            cells.forEach((cell) => {
                const cellElement = cell as HTMLTableCellElement;
                const text = cellElement.textContent?.trim() || "";
                const colspan = cellElement.colSpan || 1;

                rowValues.push(text);
                colspans.push(colspan);

                // Add null placeholders for colspan
                for (let i = 1; i < colspan; i++) {
                    rowValues.push(null);
                }
            });

            // Create the row
            const excelRow = worksheet.addRow(rowValues);
            let colIndex = 1;

            // Second pass: apply styling based on original cells
            cells.forEach((cell, cellIndex) => {
                const cellElement = cell as HTMLTableCellElement;
                const text = cellElement.textContent?.trim() || "";
                const colspan = colspans[cellIndex];

                const excelCell = excelRow.getCell(colIndex);

                // Apply styling based on row type
                if (isHeader) {
                    excelCell.font = { bold: true };
                    excelCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFD3D3D3" }
                    };
                    excelCell.alignment = {
                        horizontal: 'center',
                        vertical: 'middle'
                    };
                } else if (isFooter) {
                    excelCell.font = { bold: true };
                    excelCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFE6E6E6" }
                    };
                    // Apply alignment based on content
                    if (isNumericValue(text)) {
                        excelCell.alignment = { horizontal: 'right' };
                    } else {
                        excelCell.alignment = { horizontal: 'left' };
                    }
                } else {
                    // Data row - apply alignment based on content
                    if (isNumericValue(text)) {
                        excelCell.alignment = { horizontal: 'right' };
                    } else {
                        excelCell.alignment = { horizontal: 'left' };
                    }
                }

                // Apply borders
                excelCell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Handle colspan
                if (colspan > 1) {
                    worksheet.mergeCells(
                        rowIndex,
                        colIndex,
                        rowIndex,
                        colIndex + colspan - 1
                    );

                    // Apply borders to merged cells
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

        // Process header rows
        const headerRows = table.querySelectorAll("thead tr");
        headerRows.forEach((headerRow, index) => {
            processRow(headerRow as HTMLTableRowElement, index + 1, true);
        });

        // Process data rows
        const dataRows = table.querySelectorAll("tbody tr");
        let dataRowIndex = headerRows.length + 1;
        dataRows.forEach((row) => {
            processRow(row as HTMLTableRowElement, dataRowIndex, false);
            dataRowIndex++;
        });

        // Process footer rows
        const footerRows = table.querySelectorAll("tfoot tr");
        footerRows.forEach((row) => {
            processRow(row as HTMLTableRowElement, dataRowIndex, false, true);
            dataRowIndex++;
        });

        // Auto-size columns
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
        a.download = `DailySummaryIncomeReport_${new Date().toISOString().substring(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                <ButtonCustom variant="green" size="sm" className="float-left" onClick={downloadExcel}>Download Excel</ButtonCustom>
                Daily Summary Report (Guests & Rooms)
            </div>
            <div>
                <table ref={reportRef} className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-2">No</th>
                            <th>Date</th>
                            <th className="text-right">Guests Check-In</th>
                            <th className="text-right">Guests Check-Out</th>
                            <th className="text-right">Guests Existing</th>
                            <th className="text-right">Guests Total</th>
                            <th className="text-right">Rooms Check-In</th>
                            <th className="text-right">Rooms Check-Out</th>
                            <th className="text-right">Rooms Existing</th>
                            <th className="text-right">Rooms Total</th>
                            <th className="p-2 text-right">Rooms Available</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}><td className={`p-2 ${Theme.Style.tableCellText}`} colSpan={6}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {
                            totalGuestCheckIn = totalGuestCheckIn + Number(rp.guestsCheckIn);
                            totalGuestCheckOut = totalGuestCheckOut + Number(rp.guestsCheckOut);
                            totalGuestExisting = totalGuestExisting + Number(rp.guestsExisting);
                            totalGuestTotal = totalGuestTotal + Number(rp.guestsTotal);
                            totalRoomCheckIn = totalRoomCheckIn + Number(rp.roomsCheckIn);
                            totalRoomCheckOut = totalRoomCheckOut + Number(rp.roomsCheckOut);
                            totalRoomExisting = totalRoomExisting + Number(rp.roomsExisting);
                            totalRoomTotal = totalRoomTotal + Number(rp.roomsTotal);
                            totalRoomAvailable = totalRoomAvailable + Number(rp.roomsAvailable);


                            return <tr key={index} className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className="p-2">{index + 1}</td>
                                <td className="">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                <td className="text-right">{rp.guestsCheckIn}</td>
                                <td className="text-right">{rp.guestsCheckOut}</td>
                                <td className="text-right">{rp.guestsExisting}</td>
                                <td className="text-right">{rp.guestsTotal}</td>
                                <td className="text-right">{rp.roomsCheckIn}</td>
                                <td className="text-right">{rp.roomsCheckOut}</td>
                                <td className="text-right">{rp.roomsExisting}</td>
                                <td className="text-right">{rp.roomsTotal}</td>
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
                            <th className="text-right">{totalGuestExisting}</th>
                            <th className="text-right">{totalGuestTotal}</th>
                            <th className="text-right">{totalRoomCheckIn}</th>
                            <th className="text-right">{totalRoomCheckOut}</th>
                            <th className="text-right">{totalRoomExisting}</th>
                            <th className="text-right">{totalRoomTotal}</th>
                            <th className="p-2 text-right">{totalRoomAvailable}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}