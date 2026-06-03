import React from 'react';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import { Theme } from '@/core/constants';
import ExcelJS from 'exceljs';
import { PickupDropoffReportResponse } from '@/core/models/dto/reports/PickupDropoffReportResponse';

interface PickupDropoffReportProps {
    report: PickupDropoffReportResponse;
    arrivalStartDateTime: string;
    arrivalEndDateTime: string;
    departureStartDateTime: string;
    departureEndDateTime: string;
}

export default function PickupDropoffReport({ report, arrivalStartDateTime, arrivalEndDateTime, departureStartDateTime, departureEndDateTime }: PickupDropoffReportProps) {
    const reportRef = React.useRef<HTMLDivElement | null>(null);

    const formatCustomerName = (customer: any) => {
        const englishName = customer.englishName?.trim();
        const name = customer.name?.trim();
        if (englishName && name && englishName !== name) {
            return `${englishName} (${name})`;
        }
        return englishName || name || '';
    };

    const fetchReportByLocation = async (location: string) => {
        try {
            const searchParams = new URLSearchParams({
                arrivalStartDateTime,
                arrivalEndDateTime,
                departureStartDateTime,
                departureEndDateTime,
            });
            const url = `/api/reports/pickupdropoffreport?${searchParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Resort-Location': location,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                const body = await response.json().catch(() => null);
                return { location, error: body?.message || `Failed to fetch report for ${location}` };
            }
            const payload = await response.json();
            return { location, data: payload?.data as PickupDropoffReportResponse };
        } catch (error) {
            return { location, error: error instanceof Error ? error.message : String(error) };
        }
    };

    const writeLocationSection = (worksheet: ExcelJS.Worksheet, location: string, reportData?: PickupDropoffReportResponse, error?: string, startColumn = 1): void => {
        const borderStyle = { style: 'thin' } as any;
        let rowIndex = 1;
        const columnCount = 10;

        const header = worksheet.getRow(rowIndex);
        const pickupFromDate = arrivalStartDateTime ? new Date(arrivalStartDateTime).toISOFormatDateString() : '';
        header.getCell(startColumn).value = `Pickup & Dropoff Report - ${location}${pickupFromDate ? ` (${pickupFromDate})` : ''}`;
        header.getCell(startColumn).font = { bold: true, size: 14 };
        worksheet.mergeCells(rowIndex, startColumn, rowIndex, startColumn + columnCount - 1);
        header.commit();
        rowIndex += 2;

        if (error) {
            const errorRow = worksheet.getRow(rowIndex);
            errorRow.getCell(startColumn).value = `Error: ${error}`;
            errorRow.getCell(startColumn).font = { color: { argb: 'FFFF0000' }, bold: true };
            worksheet.mergeCells(rowIndex, startColumn, rowIndex, startColumn + columnCount - 1);
            errorRow.commit();
            return;
        }

        const summaryRow = worksheet.getRow(rowIndex);
        summaryRow.getCell(startColumn).value = 'Total Check In';
        summaryRow.getCell(startColumn + 1).value = reportData?.summary.totalCheckIn;
        summaryRow.getCell(startColumn + 2).value = 'Total Check In Pax';
        summaryRow.getCell(startColumn + 3).value = reportData?.summary.totalCheckInPax;
        summaryRow.getCell(startColumn + 4).value = 'Total Check Out';
        summaryRow.getCell(startColumn + 5).value = reportData?.summary.totalCheckOut;
        summaryRow.getCell(startColumn + 6).value = 'Total Check Out Pax';
        summaryRow.getCell(startColumn + 7).value = reportData?.summary.totalCheckOutPax;
        for (let i = 0; i < 8; i++) {
            const cell = summaryRow.getCell(startColumn + i);
            cell.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
            cell.font = { bold: true };
        }
        summaryRow.commit();
        rowIndex += 2;

        const writeCheckTable = (rows: any[], title: string, startRow: number, includeSendingFee = false): number => {
            const titleRow = worksheet.getRow(startRow);
            titleRow.getCell(startColumn).value = title;
            titleRow.getCell(startColumn).font = { bold: true };
            worksheet.mergeCells(startRow, startColumn, startRow, startColumn + columnCount - 1);
            titleRow.commit();
            let currentRow = startRow + 1;

            const headers = includeSendingFee
                ? ['No', 'Customers', 'Pax', 'Departure Date', 'Departure Flight No', 'Departure Time', 'Room', 'Sending Fee', 'Driver/Car', 'Remark']
                : ['No', 'Customers', 'Pax', 'Arrival Date', 'Arrival Flight No', 'Arrival Time', 'Room', 'Driver/Car', 'Remark'];

            const headerRow = worksheet.getRow(currentRow);
            headers.forEach((text, idx) => {
                const cell = headerRow.getCell(startColumn + idx);
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
                    includeSendingFee ? row.departureFlightNo || '' : row.arrivalFlightNo || '',
                    timeValue,
                    row.room || '',
                    ...(includeSendingFee ? [row.sendingFee || '', row.driverCar || '', row.remark || ''] : [row.driverCar || '', row.remark || ''])
                ];
                values.forEach((value, idx) => {
                    const c = excelRow.getCell(startColumn + idx);
                    c.value = value;
                    c.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
                    c.alignment = { vertical: 'top', horizontal: 'left', wrapText: true } as any;
                });
                excelRow.commit();
                currentRow++;
            });
            return currentRow + 1;
        };

        if (reportData) {
            rowIndex = writeCheckTable(reportData.checkIn, 'Check-In', rowIndex, false);
            rowIndex = writeCheckTable(reportData.checkOut, 'Check-Out', rowIndex, true);
        }
    };

    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('PickupDropoffReport');
        const locations = ['MIDA', 'KKC', 'HH'];
        const results = await Promise.all(locations.map(fetchReportByLocation));

        const blockWidth = 10;
        const gap = 1;
        results.forEach((result, index) => {
            const startColumn = index * (blockWidth + gap) + 1;
            writeLocationSection(worksheet, result.location, result.data, result.error, startColumn);
        });

        for (let i = 1; i <= locations.length * (blockWidth + gap); i++) worksheet.getColumn(i).width = 18;

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PickupDropoffReport_AllLocations_${new Date().toISOString().substring(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const renderRows = (rows: any[], checkOut = false) => {
        if (!rows?.length) {
            return (
                <tr>
                    <td colSpan={checkOut ? 9 : 8} className="p-2">No Data</td>
                </tr>
            );
        }
        return rows.map((row: any, index: number) => {
            return (
                <tr key={row.reservationId ?? index} className="even:bg-slate-100">
                    <td className="p-2 text-left">{index + 1}</td>
                    <td>{row.names?.map((n: string, i: number) => <div key={i}>{n}</div>)}</td>
                    <td className="p-2">{row.pax}</td>
                    <td className="p-2">{checkOut ? new Date(row.departureDate).toISODateString() : new Date(row.arrivalDate).toISODateString()}</td>
                    <td className="p-2">{checkOut ? row.departureFlightNo || '' : row.arrivalFlightNo || ''}</td>
                    <td className="p-2">{checkOut ? new Date(row.departureTime).toISOShortTimeString() : new Date(row.arrivalTime).toISOShortTimeString()}</td>
                    <td className="p-2">{row.room}</td>
                    {checkOut && <td className="p-2">{row.sendingFee || ''}</td>}
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
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Arrival Flight No</th>
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
                            <th className="p-2 max-w-[50px] text-left" style={{maxWidth: '50px'}}>Departure Flight No</th>
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
