import React from 'react';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import { Theme } from '@/core/constants';
import ExcelJS from 'exceljs';
import { PickupDropoffReportResponse } from '@/core/models/dto/reports/PickupDropoffReportResponse';

export default function PickupDropoffReport({ report }: { report: PickupDropoffReportResponse }) {
    const reportRef = React.useRef<HTMLTableElement | null>(null);

    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('PickupDropoffReport');

        // layout: place left (MIDA) starting at column B (2) so header spans B+C,
        // and right (KKC) starting at column L (12) so header spans L+M
        const leftCol = 2; // column B
        const rightCol = 12; // column L

        const borderStyle = { style: 'thin' } as any;

        const writeSummary = (summary: any, startRow: number, startCol: number): number => {
            let r = startRow;
            // Two rows: Total Check In and Total Check Out
            const rows = [
                { label: 'Total Check In' , pax: `${summary.totalCheckInPax} Pax` },
                { label: 'Total Check Out', pax: `${summary.totalCheckOutPax} Pax` }
            ];
            rows.forEach(row => {
                const excelRow = worksheet.getRow(r);
                // No column small
                const noCell = excelRow.getCell(startCol);
                noCell.value = '';
                noCell.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };

                const nameCell = excelRow.getCell(startCol + 1);
                nameCell.value = `${row.label}`;
                nameCell.font = { bold: true };
                nameCell.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };

                const paxCell = excelRow.getCell(startCol + 2);
                paxCell.value = row.pax;
                paxCell.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };

                excelRow.commit();
                r++;
            });
            return r + 1; // leave one blank row after summary
        };

        const writeCheckTable = (rowsData: any[], headers: string[], startRow: number, startCol: number): number => {
            let r = startRow;
            // write header
            const headerRow = worksheet.getRow(r);
            headers.forEach((h, i) => {
                const c = headerRow.getCell(startCol + i);
                c.value = h;
                c.font = { bold: true };
                c.alignment = { vertical: 'middle', horizontal: 'center' } as any;
                c.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
            });
            headerRow.commit();
            r++;

            // write rows
            rowsData.forEach((d, idx) => {
                const excelRow = worksheet.getRow(r);
                headers.forEach((h, i) => {
                    const key = (h || '').toString().toLowerCase();
                    let value: any = '';
                    switch (key) {
                        case 'no': value = `${idx + 1}`; break;
                        case 'name': value = (d.names || []).join('\n'); break;
                        case 'pax': value = `${d.pax ?? ''}`; break;
                        case 'arrival date': value = `${d.arrivalDate ? new Date(d.arrivalDate).getUTCDateTimeAsLocalDateTime().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}`; break;
                        case 'flight no': value = `${d.flightNo ?? ''}`; break;
                        case 'arrival time': value = `${d.arrivalTime ? new Date(d.arrivalTime).getUTCDateTimeAsLocalDateTime().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}`; break;
                        case 'room': value = `${d.room ?? ''}`; break;
                        case 'sending fee': value = `${d.sendingFee ?? ''}`; break;
                        case 'remark': value = `${d.remark ?? ''}`; break;
                        default: value = '';
                    }
                    const c = excelRow.getCell(startCol + i);
                    c.value = value;
                    // enable wrapText when value contains newline so Excel shows lines
                    if (typeof value === 'string' && value.indexOf('\n') >= 0) {
                        c.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true } as any;
                    } else {
                        c.alignment = { vertical: 'middle', horizontal: 'left' } as any;
                    }
                    c.border = { top: borderStyle, left: borderStyle, bottom: borderStyle, right: borderStyle };
                });
                excelRow.commit();
                r++;
            });
            return r + 1; // blank row after
        };

        const writeLocationFromData = (locData: any, startCol: number, locLabel: string) => {
            if (!locData) return;
            let rowPtr = 1;

            // main location header (colspan 2)
            const headerRow = worksheet.getRow(rowPtr);
            const headerCell = headerRow.getCell(startCol);
            headerCell.value = locLabel;
            headerCell.font = { bold: true, size: 14 };
            headerCell.alignment = { vertical: 'middle', horizontal: 'center' } as any;
            // merge two columns for main header
            try { worksheet.mergeCells(rowPtr, startCol, rowPtr, startCol + 1); } catch { }
            headerRow.commit();
            rowPtr++;

            rowPtr = writeSummary(locData.summary, rowPtr, startCol);

            // Check-In (Pickup) section header with date
            const pickupDate = (locData.checkIn && locData.checkIn[0] && locData.checkIn[0].arrivalDate) ? new Date(locData.checkIn[0].arrivalDate).getUTCDateTimeAsLocalDateTime().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
            const pickupTitleRow = worksheet.getRow(rowPtr);
            const pickupTitle = `PICK UP LIST ${pickupDate ? `(${pickupDate})` : ''}`;
            pickupTitleRow.getCell(startCol).value = pickupTitle;
            pickupTitleRow.getCell(startCol).font = { bold: true };
            try { worksheet.mergeCells(rowPtr, startCol, rowPtr, startCol + 7); } catch { }
            pickupTitleRow.commit();
            rowPtr++;

            // Check-In table
            const checkInHeaders = ['No', 'Name', 'Pax', 'Arrival Date', 'Flight No', 'Arrival Time', 'Room', 'Remark'];
            rowPtr = writeCheckTable(locData.checkIn || [], checkInHeaders, rowPtr, startCol);

            // Check-Out (Dropoff) section header with date
            const dropDate = (locData.checkOut && locData.checkOut[0] && locData.checkOut[0].arrivalDate) ? new Date(locData.checkOut[0].arrivalDate).getUTCDateTimeAsLocalDateTime().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
            const dropTitleRow = worksheet.getRow(rowPtr);
            const dropTitle = `DROP OFF LIST ${pickupDate ? `(${pickupDate})` : ''}`;
            dropTitleRow.getCell(startCol).value = dropTitle;
            dropTitleRow.getCell(startCol).font = { bold: true };
            try { worksheet.mergeCells(rowPtr, startCol, rowPtr, startCol + 8); } catch { }
            dropTitleRow.commit();
            rowPtr++;

            // Check-Out table (with Sending Fee inserted before Remark)
            const checkOutHeaders = ['No', 'Name', 'Pax', 'Arrival Date', 'Flight No', 'Arrival Time', 'Room', 'Sending Fee', 'Remark'];
            rowPtr = writeCheckTable(locData.checkOut || [], checkOutHeaders, rowPtr, startCol);
        };

        writeLocationFromData((report as any).mida, leftCol, "MIDA");
        writeLocationFromData((report as any).kkc, rightCol, "KKC");

        // set some reasonable column widths
        for (let i = leftCol; i < leftCol + 10; i++) worksheet.getColumn(i).width = 18;
        for (let i = rightCol; i < rightCol + 10; i++) worksheet.getColumn(i).width = 18;

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PickupDropoffReport_${new Date().toISOString().substring(0,10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const renderLocation = (locKey: 'mida' | 'kkc', locLabel: string) => {
        const data = (report as any)[locKey];
        if (!data) return null;
        return (
            <div className="mb-6">
                <div className="text-center text-[14pt] font-bold mb-2">{locLabel}</div>
                <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                    <thead>
                        <tr className={`${Theme.Style.tableHeadBg}`}>
                            <th colSpan={2} className="p-2">{data.summary.location}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2">Total Check In</td>
                            <td className="p-2">{data.summary.totalCheckInPax} Pax</td>
                        </tr>
                        <tr>
                            <td className="p-2">Total Check Out</td>
                            <td className="p-2">{data.summary.totalCheckOutPax} Pax</td>
                        </tr>
                    </tbody>
                </table>

                <div className="mt-4">
                    <div className="font-semibold">Check-In</div>
                    <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                        <thead>
                            <tr className={`${Theme.Style.tableHeadBg}`}>
                                <th> No</th>
                                <th>Name</th>
                                <th>Pax</th>
                                <th>Arrival Date</th>
                                <th>Flight No</th>
                                <th>Arrival Time</th>
                                <th>Room</th>
                                <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.checkIn?.length === 0 && <tr><td colSpan={8}>No Data</td></tr>}
                            {data.checkIn?.map((r: any, idx: number) => (
                                <tr key={r.reservationId ?? idx}>
                                    <td style={{paddingLeft: "5px"}}>{idx + 1}</td>
                                    <td>{r.names?.map((n: string, i: number) => <div key={i}>{n}</div>)}</td>
                                    <td>{r.pax}</td>
                                    <td>{r.arrivalDate ? new Date(r.arrivalDate).getUTCDateTimeAsLocalDateTime().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</td>
                                    <td>{r.flightNo}</td>
                                    <td>{r.arrivalTime ? new Date(r.arrivalTime).getUTCDateTimeAsLocalDateTime().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</td>
                                    <td>{r.room}</td>
                                    <td>{r.remark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4">
                    <div className="font-semibold">Check-Out</div>
                    <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
                        <thead>
                            <tr className={`${Theme.Style.tableHeadBg}`}>
                                <th>No</th>
                                <th>Name</th>
                                <th>Pax</th>
                                <th>Arrival Date</th>
                                <th>Flight No</th>
                                <th>Arrival Time</th>
                                <th>Room</th>
                                <th>Sending Fee</th>
                                <th>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.checkOut?.length === 0 && <tr><td colSpan={9}>No Data</td></tr>}
                            {data.checkOut?.map((r: any, idx: number) => (
                                <tr key={r.reservationId ?? idx}>
                                    <td style={{paddingLeft: "5px"}}>{idx + 1}</td>
                                    <td>{r.names?.map((n: string, i: number) => <div key={i}>{n}</div>)}</td>
                                    <td>{r.pax}</td>
                                    <td>{r.arrivalDate ? new Date(r.arrivalDate).getUTCDateTimeAsLocalDateTime().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</td>
                                    <td>{r.flightNo}</td>
                                    <td>{r.arrivalTime ? new Date(r.arrivalTime).getUTCDateTimeAsLocalDateTime().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</td>
                                    <td>{r.room}</td>
                                    <td>{r.sendingFee ?? ''}</td>
                                    <td>{r.remark}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="flex items-center justify-between">
                <div className="text-[16pt] font-bold">Pick-Up & Drop-Off Report</div>
                <ButtonCustom variant="green" size="sm" onClick={downloadExcel}>Download Excel</ButtonCustom>
            </div>
            <div>
                <table ref={reportRef} className="w-full">
                    <tbody>
                        <tr>
                            <td></td>
                            <td className="align-top">{renderLocation('mida', 'MIDA')}</td>
                            <td style={{ width: '20px' }}>&nbsp;</td>
                            <td className="align-top">{renderLocation('kkc', 'KKC')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
