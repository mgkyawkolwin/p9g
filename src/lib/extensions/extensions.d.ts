declare global {

  interface Date {
    convertToFakeLocalDate(): Date,
    convertToUTCFromFakeLocalDate(): Date,
    convertToUTCFromFakeLocalDateTime(): Date,
    toISOFormatDateString(): string;
    toISODateTimeDisplayString(): string;
    toISOFormatDateTimeString(): string;
    toISOFormatDateTimeMidNightString(): string;
  }

  interface String {
    trimISODateString(): string;
    trimISOTimeString(): string;
    padISOTimeString(): string;
    padISOMidNightTimeString(): string;
  }
}


export { };