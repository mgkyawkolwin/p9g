declare global {

  interface Date {
    getUTCDateTimeAsLocalDateTime(): Date,
    getLocalDateAsUTCDate(): Date,
    getLocalDateTimeAsUTCDateTime(): Date,
    toLocalShortTimeString(): string;
    toISOFormatDateString(): string;
    toISODateTimeDisplayString(): string;
    toISOFormatDateTimeString(): string;
    toISOFormatDateTimeMidNightString(): string;
    toUTCShortTimeString(): string;
  }

  interface String {
    trimISODateString(): string;
    trimISOTimeString(): string;
    padISOTimeString(): string;
    padISOMidNightTimeString(): string;
  }
}


export { };