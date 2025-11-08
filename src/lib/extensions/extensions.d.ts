declare global {

  interface Date {
    getUTCDateAsLocalDate(): Date,
    getUTCDateTimeAsLocalDateTime(): Date,
    getLocalDateAsUTCDate(): Date,
    getLocalDateTimeAsUTCDateTime(): Date,
    toLocalShortTimeString(): string;
    toISOFormatDateString(): string;
    toISODateTimeDisplayString(): string;
    toISOFormatDateTimeString(): string;
    toISOFormatDateTimeMidNightString(): string;
    toISODateString(): string;
    toISOShortTimeString(): string;
    toISOShortTimeAMPMString(): string;
    toISOTimeString(): string;
  }

  interface String {
    trimISODateString(): string;
    trimISOTimeString(): string;
    padISOTimeString(): string;
    padISOMidNightTimeString(): string;
  }
}


export { };