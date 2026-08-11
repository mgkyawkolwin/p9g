export default class DailySummaryZoneGuestsReportRow {
    public date: Date;
    public zone: string = '';
    public guestsCheckIn: number = 0;
    public guestsCheckOut: number = 0;
    public guestsSameDayCheckOut: number = 0;
    public guestsTotal: number = 0;
    public reservationTotal: number = 0;
    public roomsTotal: number = 0;
}
