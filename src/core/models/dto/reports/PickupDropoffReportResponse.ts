export interface PickupDropoffRow {
  reservationId: string;
  names: string[];
  pax: number;
  arrivalDate: string; // formatted date
  flightNo: string;
  arrivalTime: string; // formatted time
  room: string;
  remark: string;
  sendingFee?: string;
}

export interface PickupDropoffSummary {
  location: 'MIDA' | 'KKC';
  totalCheckIn: number;
  totalCheckInPax: number;
  totalCheckOut: number;
  totalCheckOutPax: number;
}

export interface PickupDropoffLocation {
  summary: PickupDropoffSummary;
  checkIn: PickupDropoffRow[];
  checkOut: PickupDropoffRow[];
}

export interface PickupDropoffReportResponse {
  mida: PickupDropoffLocation;
  kkc: PickupDropoffLocation;
}
