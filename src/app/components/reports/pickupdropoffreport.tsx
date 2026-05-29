import React from 'react';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import { Theme } from '@/core/constants';
import ExcelJS from 'exceljs';
import { PickupDropoffReportResponse } from '@/core/models/dto/reports/PickupDropoffReportResponse';

export default function PickupDropoffReport({ report }: { report: PickupDropoffReportResponse }) {
    const reportRef = React.useRef<HTMLDivElement | null>(null);

    const formatCustomerName = (customer: any) => {
        const englishName = customer.englishName?.trim();
        const name = customer.name?.trim();
        if (englishName && name && englishName !== name) {
            return `${englishName} (${name})`;
        }
        return englishName || name || '';
    };

    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('PickupDropoffReport');
        const borderStyle = { style: 'thin' } as any;
        let rowIndex = 1;

        const header = worksheet.getRow(rowIndex);
        header.getCell(1).value = `Pickup & Dropoff Report`;
        header.getCell(1).font = { bold: true, size: 14 };
        worksheet.mergeCells(rowIndex, 1, rowIndex, 10);
        header.commit();
        rowIndex += 2;

        const summaryRow = worksheet.getRow(rowIndex);
        summaryRow.getCell(1).value = 'Total Check In';
        summaryRow.getCell(2).value = report.summary.totalCheckIn;
        summaryRow.getCell(3).value = 'Total Check In Pax';
        summaryRow.getCell(4).value = report.summary.totalCheckInPax;
        summaryRow.getCell(5).value = 'Total Check Out';
        summaryRow.getCell(6).value = report.summary.totalCheckOut;
        summaryRow.getCell(7).value = 'Total Check Out Pax';
        summaryRow.getCell(8).value = report.summary.totalCheckOutPax;
        for (let i = 1; i <= 8; i++) {
            const cell = summaryRow.getCell(i);
            cell.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
            cell.font = { bold: true };
        }
        summaryRow.commit();
        rowIndex += 2;

        const writeCheckTable = (rows: any[], title: string, startRow: number, includeSendingFee = false): number => {
            const titleRow = worksheet.getRow(startRow);
            titleRow.getCell(1).value = title;
            titleRow.getCell(1).font = { bold: true };
            worksheet.mergeCells(startRow, 1, startRow, includeSendingFee ? 10 : 9);
            titleRow.commit();
            let currentRow = startRow + 1;

            const headers = includeSendingFee
                ? ['No', 'Customers', 'Pax', 'Departure Date', 'Flight No', 'Departure Time', 'Room', 'Sending Fee', 'Driver/Car', 'Remark']
                : ['No', 'Customers', 'Pax', 'Arrival Date', 'Flight No', 'Arrival Time', 'Room', 'Driver/Car', 'Remark'];

            const headerRow = worksheet.getRow(currentRow);
            headers.forEach((text, idx) => {
                const cell = headerRow.getCell(idx + 1);
                cell.value = text;
                cell.font = { bold: true };
                cell.alignment = { horizontal: 'center', vertical: 'middle' } as any;
                cell.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
            });
            headerRow.commit();
            currentRow++;

            rows.forEach((row: any, index: number) => {
                const excelRow = worksheet.getRow(currentRow);
                const nameValue = (row.names || []).filter(Boolean).join('\n');
                const dateValue = includeSendingFee ? new Date(row.departureDate).toISODateString() || '' : new Date(row.arrivalDate).toISODateString() || '';
                const timeValue = includeSendingFee ? new Date(row.departureTime).toISOShortTimeString() || '' : new Date(row.arrivalTime).toISOShortTimeString() || '';
                const values = [
                    index + 1,
                    nameValue,
                    row.pax,
                    dateValue,
                    row.flightNo || '',
                    timeValue,
                    row.room || '',
                    ...(includeSendingFee ? [row.sendingFee || '', row.driverCar || '', row.remark || ''] : [row.driverCar || '', row.remark || ''])
                ];
                values.forEach((value, idx) => {
                    const c = excelRow.getCell(idx + 1);
                    c.value = value;
                    c.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
                    c.alignment = { vertical: 'top', horizontal: 'left', wrapText: true } as any;
                });
                excelRow.commit();
                currentRow++;
            });
            return currentRow + 1;
        };

        rowIndex = writeCheckTable(report.checkIn, 'Check-In', rowIndex, false);
        rowIndex = writeCheckTable(report.checkOut, 'Check-Out', rowIndex, true);

        for (let i = 1; i <= 10; i++) worksheet.getColumn(i).width = 18;

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PickupDropoffReport_${new Date().toISOString().substring(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const renderRows = (rows: any[], includeSendingFee = false) => {
        if (!rows?.length) {
            return (
                <tr>
                    <td colSpan={includeSendingFee ? 9 : 8} className="p-2">No Data</td>
                </tr>
            );
        }
        return rows.map((row: any, index: number) => {
            return (
                <tr key={row.reservationId ?? index} className="even:bg-slate-100">
                    <td className="p-2 text-left">{index + 1}</td>
                    <td>{row.names?.map((n: string, i: number) => <div key={i}>{n}</div>)}</td>
                    <td className="p-2">{row.pax}</td>
                    <td className="p-2">{includeSendingFee ? new Date(row.departureDate).toISODateString() : new Date(row.arrivalDate).toISODateString()}</td>
                    <td className="p-2">{row.flightNo}</td>
                    <td className="p-2">{includeSendingFee ? new Date(row.departureTime).toISOShortTimeString() : new Date(row.arrivalTime).toISOShortTimeString()}</td>
                    <td className="p-2">{row.room}</td>
                    {includeSendingFee && <td className="p-2">{row.sendingFee || ''}</td>}
                    <td className="p-2">{row.driverCar || ''}</td>
                    <td className="p-2">{row.remark || ''}</td>
                </tr>
            );
        });
    };

    return (
        <div className="flex flex-col w-full gap-4" ref={reportRef}>
            <div className="flex items-center justify-between">
                <ButtonCustom variant="green" size="sm" onClick={downloadExcel}>Download Excel</ButtonCustom>
            </div>
            <div>
                <div className="font-semibold mb-2">Summary</div>
                <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`${Theme.Style.tableHeadBg}`}>
                            <th className="p-2">Summary</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2">Total Check In</td>
                            <td className="p-2">{report.summary.totalCheckIn}</td>
                        </tr>
                        <tr>
                            <td className="p-2">Total Check In Pax</td>
                            <td className="p-2">{report.summary.totalCheckInPax}</td>
                        </tr>
                        <tr>
                            <td className="p-2">Total Check Out</td>
                            <td className="p-2">{report.summary.totalCheckOut}</td>
                        </tr>
                        <tr>
                            <td className="p-2">Total Check Out Pax</td>
                            <td className="p-2">{report.summary.totalCheckOutPax}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <div className="font-semibold mb-2">Check-In</div>
                <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`${Theme.Style.tableHeadBg}`}>
                            <th className="p-2 max-w-[20px] text-left" style={{maxWidth: '20px'}}>No</th>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 max-w-[20px] text-left" style={{maxWidth: '20px'}}>Pax</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Arrival Date</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Flight No</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Arrival Time</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Room</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Driver/Car</th>
                            <th className="p-2 text-left">Remark</th>
                        </tr>
                    </thead>
                    <tbody>{renderRows(report.checkIn)}</tbody>
                </table>
            </div>
            <div>
                <div className="font-semibold mb-2">Check-Out</div>
                <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`${Theme.Style.tableHeadBg}`}>
                            <th className="p-2 max-w-[20px] text-left" style={{maxWidth: '20px'}}>No</th>
                            <th className="p-2 max-w-[30px] text-left">Name</th>
                            <th className="p-2 max-w-[20px] text-left" style={{maxWidth: '20px'}}>Pax</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Departure Date</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Flight No</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Departure Time</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Room</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Sending Fee</th>
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Driver/Car</th>
                            <th className="p-2 text-left">Remark</th>
                        </tr>
                    </thead>
                    <tbody>{renderRows(report.checkOut, true)}</tbody>
                </table>
            </div>
        </div>
    );
}
