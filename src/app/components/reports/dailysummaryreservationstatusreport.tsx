import DailySummaryReservationStatusReportRow from '@/core/models/dto/reports/DailySummaryReservationStatusReportRow';
import { Theme } from '@/core/constants';
import ExcelJS from 'exceljs';
import React from 'react';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';

export default function DailySummaryReservationStatusReport({ reportRows }: { reportRows: DailySummaryReservationStatusReportRow[] }) {
    const reportRef = React.useRef(null);

    const statusColumns = React.useMemo(
        () => [
            { key: 'newCount', label: 'NEW' },
            { key: 'waitingCount', label: 'WTG' },
            { key: 'confirmedCount', label: 'CFM' },
            { key: 'checkedInCount', label: 'CIN' },
            { key: 'checkedOutCount', label: 'OUT' },
            { key: 'cancelledCount', label: 'CCL' }
        ],
        []
    );

    const totalsByStatus = React.useMemo(() => {
        const totals: Record<string, number> = {};
        statusColumns.forEach((column) => {
            totals[column.key] = 0;
        });

        reportRows?.forEach((row) => {
            statusColumns.forEach((column) => {
                totals[column.key] += Number((row as any)[column.key] ?? 0);
            });
        });

        return totals;
    }, [reportRows, statusColumns]);

    const grandTotal = React.useMemo(() => {
        return statusColumns.reduce((sum, column) => sum + (totalsByStatus[column.key] ?? 0), 0);
    }, [statusColumns, totalsByStatus]);

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
        const worksheet = workbook.addWorksheet('DailySummaryReservationStatusReport');
        const table = reportRef.current as HTMLTableElement;

        const processRow = (row: HTMLTableRowElement, rowIndex: number, isHeader: boolean, isFooter: boolean = false) => {
            const cells = row.querySelectorAll('th, td');
            const rowValues: any[] = [];
            const colspans: number[] = [];

            cells.forEach((cell) => {
                const cellElement = cell as HTMLTableCellElement;
                const text = cellElement.textContent?.trim() || '';
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
                const text = cellElement.textContent?.trim() || '';
                const colspan = colspans[cellIndex];
                const excelCell = excelRow.getCell(colIndex);

                if (isHeader) {
                    excelCell.font = { bold: true };
                    excelCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFD3D3D3' }
                    };
                    excelCell.alignment = { horizontal: 'center', vertical: 'middle' };
                } else if (isFooter) {
                    excelCell.font = { bold: true };
                    excelCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE6E6E6' }
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
                    worksheet.mergeCells(rowIndex, colIndex, rowIndex, colIndex + colspan - 1);
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

        const headerRows = table.querySelectorAll('thead tr');
        headerRows.forEach((headerRow, index) => processRow(headerRow as HTMLTableRowElement, index + 1, true));

        const dataRows = table.querySelectorAll('tbody tr');
        let dataRowIndex = headerRows.length + 1;
        dataRows.forEach((row) => {
            processRow(row as HTMLTableRowElement, dataRowIndex, false);
            dataRowIndex++;
        });

        const footerRows = table.querySelectorAll('tfoot tr');
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
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DailySummaryReservationStatusReport_${new Date().toISOString().substring(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">
                <ButtonCustom variant="green" size="sm" className="float-left" onClick={downloadExcel}>Download Excel</ButtonCustom>
                Daily Summary Report (Reservation Status)
            </div>
            <div>
                <table ref={reportRef} className={`w-full text-[10pt] ${Theme.Style.tableBg} table-fixed`}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-2 text-right w-[10px] max-w-[10px]" style={{ width: '50px', maxWidth: '50px' }}>No</th>
                            <th className="text-left">Date</th>
                            {statusColumns.map((column) => (
                                <th key={column.key} className="text-right pr-4" style={{ paddingRight: '16px' }}>{column.label}</th>
                            ))}
                            <th className="text-right pr-4" style={{ paddingRight: '16px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && (
                            <tr className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                <td className={`p-2 ${Theme.Style.tableCellText}`} colSpan={3 + statusColumns.length}>No Data</td>
                            </tr>
                        )}
                        {reportRows.map((rp, index) => {
                            const rowTotal = statusColumns.reduce(
                                (sum, column) => sum + Number((rp as any)[column.key] ?? 0),
                                0
                            );

                            return (
                                <tr key={`${index}-${new Date(rp.date).toISOString()}`} className={`border p-8 ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                    <td className="p-2 text-right pr-4">{index + 1}</td>
                                    <td className="text-left pr-4">{new Date(rp.date).toLocaleDateString('sv-SE')}</td>
                                    {statusColumns.map((column) => (
                                        <td key={column.key} className="text-right pr-4" style={{ paddingRight: '16px' }}>{Number((rp as any)[column.key] ?? 0)}</td>
                                    ))}
                                    <td className="text-right pr-4" style={{ paddingRight: '16px' }}>{rowTotal}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-4 text-right pr-4"></th>
                            <th className="text-left pr-4" style={{ paddingRight: '16px' }}>Total</th>
                            {statusColumns.map((column) => (
                                <th key={column.key} className="text-right pr-4" style={{ paddingRight: '16px' }}>{totalsByStatus[column.key] ?? 0}</th>
                            ))}
                            <th className="text-right pr-4" style={{ paddingRight: '16px' }}>{grandTotal}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
