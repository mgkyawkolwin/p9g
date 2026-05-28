import React from 'react';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import { Theme } from '@/core/constants';
import ExcelJS from 'exceljs';
import { PickupDropoffReportNewResponse } from '@/core/models/dto/reports/PickupDropoffReportNewResponse';

export default function PickupDropoffReportNew({ report }: { report: PickupDropoffReportNewResponse }) {
  const reportRef = React.useRef<HTMLDivElement | null>(null);

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('PickupDropoffReportNew');
    const borderStyle = { style: 'thin' } as any;
    let rowIndex = 1;

    const header = worksheet.getRow(rowIndex);
    header.getCell(1).value = `Pickup & Dropoff Report (${report.summary.location})`;
    header.getCell(1).font = { bold: true, size: 14 };
    worksheet.mergeCells(rowIndex, 1, rowIndex, 8);
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

const formatCustomerName = (customer: any) => {
        const englishName = customer.englishName?.trim();
        const name = customer.name?.trim();
        if (englishName && name && englishName !== name) {
          return `${englishName} (${name})`;
        }
        return englishName || name || '';
      };

      const writeCheckTable = (rows: any[], title: string, startRow: number): number => {
        const titleRow = worksheet.getRow(startRow);
        titleRow.getCell(1).value = title;
        titleRow.getCell(1).font = { bold: true };
        worksheet.mergeCells(startRow, 1, startRow, 8);
        titleRow.commit();
        let currentRow = startRow + 1;

        const headers = ['No', 'Name', 'Pax', 'Arrival Date', 'Flight No', 'Arrival Time', 'Room', 'Remark'];
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

        rows.forEach((row, index) => {
          const excelRow = worksheet.getRow(currentRow);
          const nameValue = (row.customers || []).map(formatCustomerName).filter(Boolean).join('\n');
          const values = [
            index + 1,
            nameValue,
          row.pax,
          row.arrivalDate ? new Date(row.arrivalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          row.flightNo || '',
          row.arrivalTime ? new Date(row.arrivalTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
          row.room || '',
          row.remark || ''
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

    rowIndex = writeCheckTable(report.checkIn, 'Check-In', rowIndex);
    rowIndex = writeCheckTable(report.checkOut, 'Check-Out', rowIndex);

    for (let i = 1; i <= 8; i++) worksheet.getColumn(i).width = 18;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PickupDropoffReportNew_${new Date().toISOString().substring(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatCustomerName = (customer: any) => {
    const englishName = customer.englishName?.trim();
    const name = customer.name?.trim();
    if (englishName && name && englishName !== name) {
      return `${englishName} (${name})`;
    }
    return englishName || name || '';
  };

  const renderRows = (rows: any[]) => {
    if (!rows?.length) {
      return (
        <tr>
          <td colSpan={8} className="p-2">No Data</td>
        </tr>
      );
    }
    return rows.map((row, index) => {
      const combinedNames = (row.customers || []).map(formatCustomerName).filter(Boolean).join('\n');
      return (
        <tr key={row.reservationId ?? index} className="even:bg-slate-100">
          <td className="p-2">{index + 1}</td>
          <td className="p-2 whitespace-pre-line">{combinedNames}</td>
          <td className="p-2">{row.pax}</td>
          <td className="p-2">{row.arrivalDate ? new Date(row.arrivalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</td>
          <td className="p-2">{row.flightNo}</td>
          <td className="p-2">{row.arrivalTime ? new Date(row.arrivalTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</td>
          <td className="p-2">{row.room}</td>
          <td className="p-2">{row.remark || ''}</td>
        </tr>
      );
    });
  };

  return (
    <div className="flex flex-col w-full gap-4" ref={reportRef}>
      <div className="flex items-center justify-between">
        <div className="text-[16pt] font-bold">Pick-Up & Drop-Off Report (NEW)</div>
        <ButtonCustom variant="green" size="sm" onClick={downloadExcel}>Download Excel</ButtonCustom>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded border border-slate-300 p-4 bg-white">
          <div className="font-semibold mb-2">Summary ({report.summary.location})</div>
          <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
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
      </div>
      <div>
        <div className="font-semibold mb-2">Check-In</div>
        <table className={`w-full text-[10pt] ${Theme.Style.tableBg}`}>
          <thead>
            <tr className={`${Theme.Style.tableHeadBg}`}>
              <th className="p-2">No</th>
              <th className="p-2">Name</th>
              <th className="p-2">Pax</th>
              <th className="p-2">Arrival Date</th>
              <th className="p-2">Flight No</th>
              <th className="p-2">Arrival Time</th>
              <th className="p-2">Room</th>
              <th className="p-2">Remark</th>
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
              <th className="p-2">No</th>
              <th className="p-2">Name</th>
              <th className="p-2">Pax</th>
              <th className="p-2">Arrival Date</th>
              <th className="p-2">Flight No</th>
              <th className="p-2">Arrival Time</th>
              <th className="p-2">Room</th>
              <th className="p-2">Remark</th>
            </tr>
          </thead>
          <tbody>{renderRows(report.checkOut)}</tbody>
        </table>
      </div>
    </div>
  );
}
