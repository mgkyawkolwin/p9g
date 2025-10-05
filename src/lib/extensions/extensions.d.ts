declare global {

  interface Date {
    getUTCDateTimeAsLocalDateTime(): Date,
    getLocalDateAsUTCDate(): Date,
    getLocalDateTimeAsUTCDateTime(): Date,
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