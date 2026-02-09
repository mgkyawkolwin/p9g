import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import { Theme } from "@/core/constants";
import ExcelJS from "exceljs";
import React from "react";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";

export default function DailySummaryIncomeReport({ reportRows }: { reportRows: DailySummaryIncomeReportRow[] }) {
    const formatter = new Intl.NumberFormat('en-US', {
        style: "decimal"
    });
    const reportRef = React.useRef(null);

    let totalCheckInReservations = 0, totalRoomCharge = 0, totalDeposit = 0, totalTaxAmount = 0, totalPaid = 0, totalDiscount = 0, totalDue = 0;
    let totalDepositBankKWR = 0, totalDepositBankMMK = 0, totalDepositBankTHB = 0, totalDepositBankUSD = 0;
    let totalDepositCashKWR = 0, totalDepositCashMMK = 0, totalDepositCashTHB = 0, totalDepositCashUSD = 0;
    let totalRoomChargeBankKWR = 0, totalRoomChargeBankMMK = 0, totalRoomChargeBankTHB = 0, totalRoomChargeBankUSD = 0;
    let totalRoomChargeCashKWR = 0, totalRoomChargeCashMMK = 0, totalRoomChargeCashTHB = 0, totalRoomChargeCashUSD = 0;
    let totalPickUpBankKWR = 0, totalPickUpBankMMK = 0, totalPickUpBankTHB = 0, totalPickUpBankUSD = 0;
    let totalPickUpCashKWR = 0, totalPickUpCashMMK = 0, totalPickUpCashTHB = 0, totalPickUpCashUSD = 0;
    let totalDropOffBankKWR = 0, totalDropOffBankMMK = 0, totalDropOffBankTHB = 0, totalDropOffBankUSD = 0;
    let totalDropOffCashKWR = 0, totalDropOffCashMMK = 0, totalDropOffCashTHB = 0, totalDropOffCashUSD = 0;
    let totalBillBankKWR = 0, totalBillBankMMK = 0, totalBillBankTHB = 0, totalBillBankUSD = 0;
    let totalBillCashKWR = 0, totalBillCashMMK = 0, totalBillCashTHB = 0, totalBillCashUSD = 0;
    let totalBankKWR = 0, totalBankMMK = 0, totalBankTHB = 0, totalBankUSD = 0;
    let totalCashKWR = 0, totalCashMMK = 0, totalCashTHB = 0, totalCashUSD = 0;
    let totalKWR = 0, totalMMK = 0, totalTHB = 0, totalUSD = 0;

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
                Daily Summary Report (Income)
            </div>
            <div>
                <table ref={reportRef} className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                        <tr key={`headrow-${Math.random()}`} className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>
                            <th key={`headcell-${Math.random()}`} className={`border-r-1 ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`} colSpan={9}>Room Payment Summary</th>
                            <th key={`headcell-${Math.random()}`} className={`border-r-1 ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`} colSpan={8}>Deposit</th>
                            <th key={`headcell-${Math.random()}`} className={`border-r-1 ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`} colSpan={8}>Room Payment</th>
                            <th key={`headcell-${Math.random()}`} className={`border-r-1 ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`} colSpan={8}>Pick Up</th>
                            <th key={`headcell-${Math.random()}`} className={`border-r-1 ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`} colSpan={8}>Drop Off</th>
                            <th key={`headcell-${Math.random()}`} className={`border-r-1 ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`} colSpan={8}>Bill</th>
                            <th key={`headcell-${Math.random()}`} className={`border-r-1 ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`} colSpan={8}>Total</th>
                            <th key={`headcell-${Math.random()}`} className={`border-r-1 ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`} colSpan={4}>Total</th>
                        </tr>
                        <tr key={`headrow-${Math.random()}`} className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>
                            <th colSpan={9} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}></th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Bank</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Cash</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Bank</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Cash</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Bank</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Cash</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Bank</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Cash</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Bank</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Cash</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Bank</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Cash</th>
                            <th colSpan={4} className={`border ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>Bank/Cash</th>
                        </tr>
                        <tr key={`headrow-${Math.random()}`} className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>
                            <th key={`headcell-${Math.random()}`} className="p-2">No</th>
                            <th key={`headcell-${Math.random()}`}>Date</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Tot Rsv</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Room Charge</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Deposit</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Tax</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Discount</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">Paid</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>Due</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className={`p-1 border-0 border-r-1 ${Theme.Style.tableHeadBorder}`}>USD</th>

                            <th key={`headcell-${Math.random()}`} className="p-1">KWR</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">MMK</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">THB</th>
                            <th key={`headcell-${Math.random()}`} className="p-1">USD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && <tr className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}><td className="p-2" colSpan={6}>No Data</td></tr>}
                        {reportRows.map((rp, index) => {
                            totalCheckInReservations += Number(rp.totalCheckInReservations);
                            totalRoomCharge += Number(rp.totalRoomCharge);
                            totalDeposit += Number(rp.totalDeposit);
                            totalTaxAmount += Number(rp.totalTaxAmount);
                            totalDiscount += Number(rp.totalDiscount);
                            totalPaid += Number(rp.totalPaid);
                            totalDue += Number(rp.totalDue);

                            totalDepositBankKWR += Number(rp.totalDepositBankKWR);
                            totalDepositBankMMK += Number(rp.totalDepositBankMMK);
                            totalDepositBankTHB += Number(rp.totalDepositBankTHB);
                            totalDepositBankUSD += Number(rp.totalDepositBankUSD);

                            totalDepositCashKWR += Number(rp.totalDepositCashKWR);
                            totalDepositCashMMK += Number(rp.totalDepositCashMMK);
                            totalDepositCashTHB += Number(rp.totalDepositCashTHB);
                            totalDepositCashUSD += Number(rp.totalDepositCashUSD);

                            totalRoomChargeBankKWR += Number(rp.totalRoomChargeBankKWR);
                            totalRoomChargeBankMMK += Number(rp.totalRoomChargeBankMMK);
                            totalRoomChargeBankTHB += Number(rp.totalRoomChargeBankTHB);
                            totalRoomChargeBankUSD += Number(rp.totalRoomChargeBankUSD);

                            totalRoomChargeCashKWR += Number(rp.totalRoomChargeCashKWR);
                            totalRoomChargeCashMMK += Number(rp.totalRoomChargeCashMMK);
                            totalRoomChargeCashTHB += Number(rp.totalRoomChargeCashTHB);
                            totalRoomChargeCashUSD += Number(rp.totalRoomChargeCashUSD);

                            totalPickUpBankKWR += Number(rp.totalPickUpBankKWR);
                            totalPickUpBankMMK += Number(rp.totalPickUpBankMMK);
                            totalPickUpBankTHB += Number(rp.totalPickUpBankTHB);
                            totalPickUpBankUSD += Number(rp.totalPickUpBankUSD);

                            totalPickUpCashKWR += Number(rp.totalPickUpCashKWR);
                            totalPickUpCashMMK += Number(rp.totalPickUpCashMMK);
                            totalPickUpCashTHB += Number(rp.totalPickUpCashTHB);
                            totalPickUpCashUSD += Number(rp.totalPickUpCashUSD);

                            totalDropOffBankKWR += Number(rp.totalDropOffBankKWR);
                            totalDropOffBankMMK += Number(rp.totalDropOffBankMMK);
                            totalDropOffBankTHB += Number(rp.totalDropOffBankTHB);
                            totalDropOffBankUSD += Number(rp.totalDropOffBankUSD);

                            totalDropOffCashKWR += Number(rp.totalDropOffCashKWR);
                            totalDropOffCashMMK += Number(rp.totalDropOffCashMMK);
                            totalDropOffCashTHB += Number(rp.totalDropOffCashTHB);
                            totalDropOffCashUSD += Number(rp.totalDropOffCashUSD);

                            totalBillBankKWR += Number(rp.totalBillBankKWR);
                            totalBillBankMMK += Number(rp.totalBillBankMMK);
                            totalBillBankTHB += Number(rp.totalBillBankTHB);
                            totalBillBankUSD += Number(rp.totalBillBankUSD);

                            totalBillCashKWR += Number(rp.totalBillCashKWR);
                            totalBillCashMMK += Number(rp.totalBillCashMMK);
                            totalBillCashTHB += Number(rp.totalBillCashTHB);
                            totalBillCashUSD += Number(rp.totalBillCashUSD);

                            totalBankKWR += Number(rp.totalBankKWR);
                            totalBankMMK += Number(rp.totalBankMMK);
                            totalBankTHB += Number(rp.totalBankTHB);
                            totalBankUSD += Number(rp.totalBankUSD);

                            totalCashKWR += Number(rp.totalCashKWR);
                            totalCashMMK += Number(rp.totalCashMMK);
                            totalCashTHB += Number(rp.totalCashTHB);
                            totalCashUSD += Number(rp.totalCashUSD);

                            totalKWR += Number(rp.totalKWR);
                            totalMMK += Number(rp.totalMMK);
                            totalTHB += Number(rp.totalTHB);
                            totalUSD += Number(rp.totalUSD);


                            return <tr key={index} className={`border p-8 ${Theme.Style.tableCellBg} ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalCheckInReservations)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomCharge)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDeposit)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalTaxAmount)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDiscount)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPaid)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalDue)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalDepositBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDepositBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDepositBankTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalDepositBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalDepositCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDepositCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDepositCashTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalDepositCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeBankTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalRoomChargeBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalRoomChargeCashTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalRoomChargeCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpBankTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalPickUpBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalPickUpCashTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalPickUpCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffBankTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalDropOffBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalDropOffCashTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalDropOffCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalBillBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBillBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBillBankTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalBillBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalBillCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBillCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBillCashTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalBillCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalBankKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBankMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalBankTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalBankUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalCashKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalCashMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalCashTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalCashUSD)}</td>

                                <td className="p-2 text-right">{formatter.format(rp.totalKWR)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalMMK)}</td>
                                <td className="p-2 text-right">{formatter.format(rp.totalTHB)}</td>
                                <td className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(rp.totalUSD)}</td>
                            </tr>;
                        })}
                    </tbody>
                    <tfoot className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                        <tr key={`headrow-${Math.random()}`} className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder} ${Theme.Style.tableHeadText}`}>
                            <th className="p-2"></th>
                            <th className="p-2">Total</th>
                            <th className="p-2 text-right">{formatter.format(totalCheckInReservations)}</th>
                            <th className="p-2 text-right">{formatter.format(totalRoomCharge)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDeposit)}</th>
                            <th className="p-2 text-right">{formatter.format(totalTaxAmount)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDiscount)}</th>
                            <th className="p-2 text-right">{formatter.format(totalPaid)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalDue)}</th>

                            <th className="p-2 text-right">{formatter.format(totalDepositBankKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDepositBankMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDepositBankTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalDepositBankUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalDepositCashKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDepositCashMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDepositCashTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalDepositCashUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalRoomChargeBankKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalRoomChargeBankMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalRoomChargeBankTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalRoomChargeBankUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalRoomChargeCashKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalRoomChargeCashMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalRoomChargeCashTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalRoomChargeCashUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalPickUpBankKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalPickUpBankMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalPickUpBankTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalPickUpBankUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalPickUpCashKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalPickUpCashMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalPickUpCashTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalPickUpCashUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalDropOffBankKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDropOffBankMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDropOffBankTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalDropOffBankUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalDropOffCashKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDropOffCashMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalDropOffCashTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalDropOffCashUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalBillBankKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalBillBankMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalBillBankTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalBillBankUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalBillCashKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalBillCashMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalBillCashTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalBillCashUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalBankKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalBankMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalBankTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalBankUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalCashKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalCashMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalCashTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalCashUSD)}</th>

                            <th className="p-2 text-right">{formatter.format(totalKWR)}</th>
                            <th className="p-2 text-right">{formatter.format(totalMMK)}</th>
                            <th className="p-2 text-right">{formatter.format(totalTHB)}</th>
                            <th className={`p-2 border-0 border-r-1 ${Theme.Style.tableCellBorder} text-right`}>{formatter.format(totalUSD)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}