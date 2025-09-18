/**
 * Convert the UTC date into ISO date format string.
 */
Date.prototype.toISODateString = function (): string {
    return this.toISOString().substring(0, 10);
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
Date.prototype.convertToFakeLocalDate = function (): Date {
    const fakeLocalDate = new Date(this.toISOString().replace('T', ' ').slice(0, 16));
    return fakeLocalDate;
}

/**
 * Convert local date value as the UTC date value.
 */
Date.prototype.convertToUTCFromFakeLocalDate = function (): Date {
    return new Date(this.toLocaleString('sv-SE').slice(0, 10) + 'T00:00:00.000Z');
}

/**
 * Convert local date/time value as the UTC date/time value.
 */
Date.prototype.convertToUTCFromFakeLocalDateTime = function (): Date {
    return new Date(this.toLocaleString('sv-SE').replace(' ', 'T') + '.000Z');
}