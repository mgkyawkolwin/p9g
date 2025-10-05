/**
 * Convert the UTC date into ISO date format string.
 */
Date.prototype.toISOFormatDateString = function (): string {
    return this.toLocaleDateString('sv-SE');
}

/**
 * Convert the UTC date into ISO date format string.
 */
Date.prototype.toISOFormatDateTimeString = function (): string {
    return this.toLocaleDateString('sv-SE').substring(0, 10) + 'T00:00:00.000Z';
}

/**
 * Convert the UTC date into ISO date format string.
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