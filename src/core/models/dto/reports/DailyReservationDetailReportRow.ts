
export default class DailyReservationDetailReportRow{
    public date: Date;
    public arrivalDateTime: string = null;
    public arrivalFlight: string = '';
    public checkInDate: Date | null = null;
    public checkOutDate: Date | null = null;
    public customerNames: string = '';
    public customerPhones: string = '';
    public departureDateTime: Date | null = null;
    public departureFlight: string = '';
    public depositAmount: number = 0;
    public discountAmount: number = 0;
    public dropOffFeeKWR: number = 0;
    public dropOffFeeMMK: number = 0;
    public dropOffFeeTHB: number = 0;
    public dropOffFeeUSD: number = 0;
    public extraChargeAmount: number = 0;
    public netAmount: number = 0;
    public noOfDays: number = 0;
    public noOfGuests: number = 0;
    public paidAmount: number = 0;
    public pickUpFeeKWR: number = 0;
    public pickUpFeeMMK: number = 0;
    public pickUpFeeTHB: number = 0;
    public pickUpFeeUSD: number = 0;
    public remark: string = '';
    public reservationId: string = '';
    public reservationType: string = '';
    public roomNo: string = '';
    public singleChargeAmount: number = 0;
    public taxAmount: number = 0;
    public totalAmount: number = 0;
} 