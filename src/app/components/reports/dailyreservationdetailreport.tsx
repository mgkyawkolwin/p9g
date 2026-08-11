import { Theme } from "@/core/constants";
import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import React from "react";
import ExcelJS from "exceljs";

export default function DailyReservationDetailReport({ reportRows }: { reportRows: DailyReservationDetailReportRow[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });

    const totalReservation = reportRows?.length ?? 0;
    const totalPax = reportRows?.reduce((sum, row) => sum + (row.noOfGuests ?? 0), 0) ?? 0;
    const totalDiscount = reportRows?.reduce((sum, row) => sum + (row.discountAmount ?? 0), 0) ?? 0;
    const totalDeposit = reportRows?.reduce((sum, row) => sum + (row.depositAmount ?? 0), 0) ?? 0;
    const totalClubAmount = reportRows?.reduce((sum, row) => sum + (row.totalAmount ?? 0), 0) ?? 0;
    const totalClubNetAmount = reportRows?.reduce((sum, row) => sum + (row.netAmount ?? 0), 0) ?? 0;
    const totalSingleCharge = reportRows?.reduce((sum, row) => sum + (row.singleChargeAmount ?? 0), 0) ?? 0;
    const totalExtraCharge = reportRows?.reduce((sum, row) => sum + (row.extraChargeAmount ?? 0), 0) ?? 0;
    const totalPickUpFeeKWR = reportRows?.reduce((sum, row) => sum + (row.pickUpFeeKWR ?? 0), 0) ?? 0;
    const totalPickUpFeeMMK = reportRows?.reduce((sum, row) => sum + (row.pickUpFeeMMK ?? 0), 0) ?? 0;
    const totalPickUpFeeTHB = reportRows?.reduce((sum, row) => sum + (row.pickUpFeeTHB ?? 0), 0) ?? 0;
    const totalPickUpFeeUSD = reportRows?.reduce((sum, row) => sum + (row.pickUpFeeUSD ?? 0), 0) ?? 0;
    const totalDropOffFeeKWR = reportRows?.reduce((sum, row) => sum + (row.dropOffFeeKWR ?? 0), 0) ?? 0;
    const totalDropOffFeeMMK = reportRows?.reduce((sum, row) => sum + (row.dropOffFeeMMK ?? 0), 0) ?? 0;
    const totalDropOffFeeTHB = reportRows?.reduce((sum, row) => sum + (row.dropOffFeeTHB ?? 0), 0) ?? 0;
    const totalDropOffFeeUSD = reportRows?.reduce((sum, row) => sum + (row.dropOffFeeUSD ?? 0), 0) ?? 0;

    const [highlightedRows, setHighlightedRows] = React.useState<Record<string, boolean>>({});
    const reportRef = React.useRef(null);

    const toggleRowHighlight = (reservationId: string) => {
        setHighlightedRows(prev => ({
            ...prev,
            [reservationId]: !prev[reservationId],
        }));
    };

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

        // Track all merges to avoid conflicts
        const plannedMerges: Array<{ top: number, left: number, bottom: number, right: number }> = [];

        // Check if a cell is already part of a merge
        const isCellInMerge = (row: number, col: number): boolean => {
            return plannedMerges.some(merge =>
                row >= merge.top && row <= merge.bottom &&
                col >= merge.left && col <= merge.right
            );
        };

        let currentExcelRow = 1;

        // Process all rows in order
        const processTableSection = (rows: NodeListOf<Element>, isHeader: boolean, isFooter: boolean = false) => {
            rows.forEach((rowElement) => {
                const row = rowElement as HTMLTableRowElement;
                const cells = row.querySelectorAll("th, td");
                const rowValues: any[] = [];
                const cellInfo: Array<{ value: any, colspan: number, rowspan: number, skip: boolean }> = [];

                // Initialize row with nulls
                // First, estimate width from previous rows or use a reasonable default
                const estimatedWidth = 60; // Based on your table structure
                for (let i = 0; i < estimatedWidth; i++) {
                    // Check if this position is already occupied by a rowspan from above
                    if (isCellInMerge(currentExcelRow, i + 1)) {
                        rowValues.push(null); // Occupied by existing merge
                        cellInfo.push({ value: null, colspan: 1, rowspan: 0, skip: true });
                    } else {
                        rowValues.push(null); // Empty slot
                        cellInfo.push({ value: null, colspan: 1, rowspan: 0, skip: false });
                    }
                }

                // Process actual cells in this row
                let currentCol = 0;
                cells.forEach((cell) => {
                    const cellElement = cell as HTMLTableCellElement;
                    const text = cellElement.textContent?.trim() || "";
                    const colspan = cellElement.colSpan || 1;
                    const rowspan = cellElement.rowSpan || 1;

                    // Find the next available column (not already merged)
                    while (currentCol < rowValues.length && cellInfo[currentCol].skip) {
                        currentCol++;
                    }

                    // If we've run out of columns, add more
                    if (currentCol >= rowValues.length) {
                        for (let i = rowValues.length; i <= currentCol + colspan; i++) {
                            rowValues.push(null);
                            cellInfo.push({ value: null, colspan: 1, rowspan: 0, skip: false });
                        }
                    }

                    // Mark this cell and its colspan range
                    for (let i = 0; i < colspan; i++) {
                        const colIndex = currentCol + i;
                        if (colIndex < rowValues.length) {
                            if (i === 0) {
                                // First cell in colspan gets the value
                                rowValues[colIndex] = text;
                                cellInfo[colIndex] = { value: text, colspan, rowspan, skip: false };
                            } else {
                                // Other cells in colspan are marked as skipped
                                rowValues[colIndex] = null;
                                cellInfo[colIndex] = { value: null, colspan: 0, rowspan: 0, skip: true };
                            }
                        }
                    }

                    // Track the merge for colspan+rowspan
                    if (colspan > 1 || rowspan > 1) {
                        const mergeRange = {
                            top: currentExcelRow,
                            left: currentCol + 1, // Excel is 1-indexed
                            bottom: currentExcelRow + rowspan - 1,
                            right: currentCol + colspan // Excel is 1-indexed, right is inclusive
                        };
                        plannedMerges.push(mergeRange);
                    }

                    currentCol += colspan;
                });

                // Remove trailing nulls
                while (rowValues.length > 0 && rowValues[rowValues.length - 1] === null) {
                    rowValues.pop();
                    cellInfo.pop();
                }

                // Create the row
                const excelRow = worksheet.addRow(rowValues);

                // Apply styling
                for (let i = 0; i < cellInfo.length; i++) {
                    const info = cellInfo[i];

                    // Skip cells that are part of colspan (not the first cell)
                    if (info.skip) continue;

                    const excelCell = excelRow.getCell(i + 1);
                    const text = info.value;

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
                }

                currentExcelRow++;
            });
        };

        // Process all sections
        processTableSection(table.querySelectorAll("thead tr"), true);
        processTableSection(table.querySelectorAll("tbody tr"), false);
        processTableSection(table.querySelectorAll("tfoot tr"), false, true);

        // Apply merges after all rows are created (to avoid conflicts)
        plannedMerges.forEach(merge => {
            try {
                // Check if merge is still valid (cells might have been adjusted)
                const isValid = merge.top >= 1 && merge.left >= 1 &&
                    merge.bottom <= worksheet.rowCount &&
                    merge.right <= worksheet.columnCount;

                if (isValid) {
                    worksheet.mergeCells(merge.top, merge.left, merge.bottom, merge.right);
                }
            } catch (error) {
                console.warn('Could not merge cells:', merge, error);
                // Skip this merge if it causes an error
            }
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
                Daily Reservation Detail Report
            </div>
            <div>
                <table ref={reportRef} className={`w-full text-[10pt]`}>
                    <thead>
                        <tr id="headrow1" className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Rsv Id</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Source</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Rsv Type</th>
                            <th rowSpan={2} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} p-2 text-left`}>Rsv Status</th>
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
                            const isHighlighted = highlightedRows[rp.reservationId];
                            const rowStyle = isHighlighted ? { backgroundColor: '#8888aa', color: 'black' } : undefined;

                            return [
                                <tr
                                    key={`${rp.reservationId}-row1`}
                                    style={rowStyle}
                                    className="cursor-pointer"
                                    onClick={() => toggleRowHighlight(rp.reservationId)}
                                >
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} max-w-[150px] p-2 text-left`}>{rp.reservationId}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} max-w-[150px] p-2 text-left`}>{rp.bookingSource}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} max-w-[150px] p-2 text-left`}>{rp.reservationType}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} max-w-[150px] p-2 text-left`}>{rp.reservationStatus}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} min-w-[150px] max-w-[150px] p-2 text-left`}>{rp.customerNames}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.noOfGuests}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.reservationType}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.arrivalDateTime.substring(0, 10)}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.arrivalDateTime.substring(11, 16)}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.arrivalFlight}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.checkInDate.toString().substring(0, 10)}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.noOfDays}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.depositAmount}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.roomNo}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.totalAmount}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.discountAmount}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.netAmount}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.singleChargeAmount}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.extraChargeAmount}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.pickUpFeeKWR}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.pickUpFeeMMK}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.pickUpFeeTHB}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.pickUpFeeUSD}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.dropOffFeeKWR}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.dropOffFeeMMK}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.dropOffFeeTHB}</td>
                                    <td rowSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.dropOffFeeUSD}</td>
                                </tr>,
                                <tr
                                    key={`${rp.reservationId}-row2`}
                                    style={rowStyle}
                                    className="cursor-pointer"
                                    onClick={() => toggleRowHighlight(rp.reservationId)}
                                >
                                    <td colSpan={2} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.customerPhones}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.departureDateTime.toString().substring(0, 10)}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.departureDateTime.toString().substring(11, 16)}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.departureFlight}</td>
                                    <td style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.checkOutDate.toString().substring(0, 10)}</td>
                                    <td colSpan={3} style={rowStyle} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>{rp.remark}</td>
                                </tr>
                            ];
                        })}
                    </tbody>
                    <tfoot>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <td colSpan={5} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-left`}>
                                Total Reservation: {totalReservation}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalPax)}
                            </td>
                            <td colSpan={7} />
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalDeposit)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalClubAmount)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalDiscount)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalClubNetAmount)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalSingleCharge)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalExtraCharge)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalPickUpFeeKWR)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalPickUpFeeMMK)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalPickUpFeeTHB)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalPickUpFeeUSD)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalDropOffFeeKWR)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalDropOffFeeMMK)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalDropOffFeeTHB)}
                            </td>
                            <td className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText} p-2 text-right`}>
                                {formatter.format(totalDropOffFeeUSD)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}