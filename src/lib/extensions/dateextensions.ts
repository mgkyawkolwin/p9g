/**
 * Display the local time with HH:mm AM/PM format
 */
Date.prototype.toLocalShortTimeString = function (): string {
    return this.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}


/**
 * Convert the UTC date into ISO date format string.
 */
Date.prototype.toISOFormatDateString = function (): string {
    return this.toLocaleDateString('sv-SE');
}

/**
 * Convert the Local date into ISO date format string. (Note: Not a ISO/UTC date, just local date in different format).
 */
Date.prototype.toISOFormatDateTimeString = function (): string {
    return this.toLocaleDateString('sv-SE') + 'T' + this.toLocaleTimeString('sv-SE') + '.000Z';
}

/**
 * Convert the Local date into ISO date format string with time 00:00:00.000. (Note: Not a ISO/UTC date, just local date in different format).
 */
Date.prototype.toISOFormatDateTimeMorningString = function (): string {
    return this.toLocaleDateString('sv-SE').substring(0, 10) + 'T00:00:00.000Z';
}

/**
 * Convert the Local date into ISO date format string with time 23:59:59.999. (Note: Not a ISO/UTC date, just local date in different format).
 */
Date.prototype.toISOFormatDateTimeMidNightString = function (): string {
    return this.toLocaleDateString('sv-SE').substring(0, 10) + 'T23:59:59.999Z';
}

/**
 * Convert the UTC date into ISO date/time string without T & Z for display purpose.
 */
Date.prototype.toISODateTimeDisplayString = function (): string {
    return this.toISOString().replace('T', ' ').substring(0, 16);
}

/**
 * Convert Local Date value as the UTC date value.
 */
Date.prototype.getUTCDateAsLocalDate = function (): Date {
    const fakeLocalDate = new Date(this.toISOString().slice(0, 10));
    return fakeLocalDate;
}

/**
 * Convert Local Date value as the UTC date value.
 */
Date.prototype.getUTCDateTimeAsLocalDateTime = function (): Date {
    const fakeLocalDate = new Date(this.toISOString().replace('T', ' ').slice(0, 16));
    return fakeLocalDate;
}

/**
 * Convert local date value as the UTC date value.
 */
Date.prototype.getLocalDateAsUTCDate = function (): Date {
    return new Date(this.toLocaleString('sv-SE').slice(0, 10) + 'T00:00:00.000Z');
}

/**
 * Convert local date/time value as the UTC date/time value.
 */
Date.prototype.getLocalDateTimeAsUTCDateTime = function (): Date {
    return new Date(this.toLocaleString('sv-SE').replace(' ', 'T') + '.000Z');
}

Date.prototype.toISODateString = function (): string {
    return this.toISOString().substring(0, 10);
}

Date.prototype.toISOShortTimeString = function (): string {
    return this.toISOString().substring(11, 16);
}

/**
 * Display the UTC/ISO time with HH:mm AM/PM format
 */
Date.prototype.toISOShortTimeAMPMString = function (): string {
    return this.getUTCDateTimeAsLocalDateTime().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

Date.prototype.toISOTimeString = function (): string {
    return this.toISOString().substring(11, 19);
}