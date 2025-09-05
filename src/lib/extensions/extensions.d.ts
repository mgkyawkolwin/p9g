declare global {
  interface Date {
    convertToFakeLocalDate(): Date,
    convertToUTCFromFakeLocalDate(): Date,
    convertToUTCFromFakeLocalDateTime(): Date,
    toISODateString(): string;
    toISODateTimeString(): string;
  }
}


export { };