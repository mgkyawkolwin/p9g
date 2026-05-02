import DailySummaryRoomOccupancyReportRow, { DailySummaryRoomOccupancyCell } from '@/core/models/dto/reports/DailySummaryRoomOccupancyReportRow';
import { Theme } from '@/core/constants';
import React from 'react';

interface DailySummaryRoomOccupancyReportProps {
    reportRows: DailySummaryRoomOccupancyReportRow[];
    dateColumns: Date[];
}

function getCellBorderStyle(activeCount: number, cancelCount: number): React.CSSProperties {
    if (activeCount === 1) return { border: '1px solid #00ff00' };
    if (activeCount === 2) return { border: '1px solid #f59e0b' };
    if (activeCount > 2) return { border: '1px solid #ff0000' };
    if (cancelCount > 0) return { border: '1px solid #94a3b8' };
    return { border: '1px solid #cbd5e1' };
}

function getStatusCircleStyle(status: string): React.CSSProperties {
    switch (status) {
        case 'NEW':
            return { backgroundColor: '#94a3b8', color: '#000000' };
        case 'CFM':
            return { backgroundColor: '#2563eb', color: '#ffffff' };
        case 'WTG':
            return { backgroundColor: '#991b1b', color: '#ffffff' };
        case 'CIN':
            return { backgroundColor: '#16a34a', color: '#ffffff' };
        case 'OUT':
            return { backgroundColor: '#475569', color: '#ffffff' };
        case 'CCL':
            return { backgroundColor: '#dc2626', color: '#ffffff' };
        default:
            return { backgroundColor: '#94a3b8', color: '#000000' };
    }
}

export default function DailySummaryRoomOccupancyReport({ reportRows, dateColumns }: DailySummaryRoomOccupancyReportProps) {
    const getDateKey = (date: Date) => date.toISOString().split('T')[0];

    const legendItems = [
        { label: 'New', status: 'NEW' },
        { label: 'Confirmed', status: 'CFM' },
        { label: 'Waiting', status: 'WTG' },
        { label: 'Check-In', status: 'CIN' },
        { label: 'Checkout', status: 'OUT' },
        { label: 'Cancelled', status: 'CCL' }
    ];

    const borderLegendItems = [
        { label: '1 reservation', color: '#00ff00' },
        { label: '2 reservations', color: '#f59e0b' },
        { label: '3+ reservations', color: '#ff0000' }
    ];

    const sortedRows = [...(reportRows ?? [])].sort((a, b) => {
        if (a.roomNo === 'No Room') return -1;
        if (b.roomNo === 'No Room') return 1;
        return 0;
    });

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="text-center text-[18pt]">Daily Summary Report (Room Occupancy)</div>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-700">
                {legendItems.map((item) => (
                    <div key={item.status} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1">
                        <span style={{ width: 12, height: 12, borderRadius: '9999px', display: 'inline-flex', ...getStatusCircleStyle(item.status) }} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-700">
                {borderLegendItems.map((item) => (
                    <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1">
                        <span style={{ width: 20, height: 14, borderRadius: 4, border: `3px solid ${item.color}`, display: 'inline-flex' }} />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
            <div className="overflow-x-auto">
                <table className={`w-full text-[10pt] ${Theme.Style.tableBg} table-fixed`} style={{ borderCollapse: 'separate' }}>
                    <thead>
                        <tr className={`border ${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                            <th className="p-2 text-left">Room</th>
                            {dateColumns.map((date) => (
                                <th key={date.toISOString()} className="p-1 text-center" title={date.toLocaleDateString('sv-SE')}>
                                    {date.getDate().toString().padStart(2, '0')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportRows?.length === 0 && (
                            <tr>
                                <td colSpan={1 + dateColumns.length} className={`p-4 text-center ${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>
                                    No Data
                                </td>
                            </tr>
                        )}
                        {sortedRows.map((row) => (
                            <tr key={row.roomNo} className={`border ${Theme.Style.tableCellBorder}`}>
                                <td className={`p-2 text-left ${Theme.Style.tableCellText} font-medium`}>{row.roomNo}</td>
                                {dateColumns.map((date) => {
                                    const key = getDateKey(date);
                                    const cell: DailySummaryRoomOccupancyCell = row.occupancyByDate[key] ?? {
                                        newCount: 0,
                                        confirmedCount: 0,
                                        waitingCount: 0,
                                        checkedInCount: 0,
                                        checkedOutCount: 0,
                                        cancelCount: 0,
                                        totalCount: 0,
                                        noRoomCount: 0
                                    };
                                    const activeCount = cell.newCount + cell.confirmedCount + cell.waitingCount + cell.checkedInCount + cell.checkedOutCount;
                                    const cancelCount = cell.cancelCount ?? 0;
                                    const cellBorderStyle = getCellBorderStyle(activeCount, cancelCount);

                                    const statusEntries = [
                                        { status: 'NEW', count: cell.newCount },
                                        { status: 'CFM', count: cell.confirmedCount },
                                        { status: 'WTG', count: cell.waitingCount },
                                        { status: 'CIN', count: cell.checkedInCount },
                                        { status: 'OUT', count: cell.checkedOutCount },
                                        { status: 'CCL', count: cell.cancelCount }
                                    ].filter((entry) => entry.count > 0);

                                    return (
                                        <td key={key} className="p-1 text-center" style={{ ...cellBorderStyle, minWidth: 20, maxWidth: 50 }}>
                                            {statusEntries.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {statusEntries.map((entry) => (
                                                        <span
                                                            key={entry.status}
                                                            style={{
                                                                minWidth: 14,
                                                                height: 14,
                                                                borderRadius: '9999px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: 14,
                                                                padding: '0 4px',
                                                                ...getStatusCircleStyle(entry.status)
                                                            }}
                                                        >
                                                            {entry.count}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ width: 18, height: 18, display: 'inline-flex', borderRadius: '9999px' }} />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
