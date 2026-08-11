export type DailySummaryRoomOccupancyCell = {
    newCount: number;
    confirmedCount: number;
    waitingCount: number;
    checkedInCount: number;
    checkedOutCount: number;
    cancelCount: number;
    noRoomCount: number;
    totalCount: number;
};

export default class DailySummaryRoomOccupancyReportRow {
    public roomNo: string = '';
    public occupancyByDate: Record<string, DailySummaryRoomOccupancyCell> = {};
}
