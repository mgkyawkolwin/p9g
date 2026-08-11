export interface PickupDropoffRow {
  reservationId: string;
  names: string[];
  pax: number;
  arrivalDate: string; // formatted date
  departureDate: string; // formatted date
  arrivalFlightNo: string;
  departureFlightNo: string;
  arrivalTime: string; // formatted time
  departureTime: string; // formatted time
  room: string;
  driverCar?: string;
  remark: string;
  sendingFee?: string;
}

export interface PickupDropoffSummary {
  totalCheckIn: number;
  totalCheckInPax: number;
  totalCheckOut: number;
  totalCheckOutPax: number;
}

export interface PickupDropoffReportResponse {
  summary: PickupDropoffSummary;
  checkIn: PickupDropoffRow[];
  checkOut: PickupDropoffRow[];
}
