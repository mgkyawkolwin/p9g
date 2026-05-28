export interface PickupDropoffReportNewCustomer {
  englishName?: string;
  name?: string;
}

export interface PickupDropoffReportNewRow {
  reservationId: string;
  customers: PickupDropoffReportNewCustomer[];
  pax: number;
  arrivalDate: string;
  flightNo: string;
  arrivalTime: string;
  room: string;
  remark: string;
  sendingFee?: string;
}

export interface PickupDropoffReportNewSummary {
  location: string;
  totalCheckIn: number;
  totalCheckInPax: number;
  totalCheckOut: number;
  totalCheckOutPax: number;
}

export interface PickupDropoffReportNewResponse {
  summary: PickupDropoffReportNewSummary;
  checkIn: PickupDropoffReportNewRow[];
  checkOut: PickupDropoffReportNewRow[];
}
