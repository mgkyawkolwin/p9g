declare global {

  interface Date {
    convertToFakeLocalDate(): Date,
    convertToUTCFromFakeLocalDate(): Date,
    convertToUTCFromFakeLocalDateTime(): Date,
    toISODateString(): string;
    toISODateTimeDisplayString(): string;
  }

  interface String {
    toISODateString(): String;
    toISODateTimeString(): String;
  }
}


export { };