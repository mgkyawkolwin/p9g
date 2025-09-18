// Extends the Date prototype to add a method that returns the date in ISO format (YYYY-MM-DD).
Date.prototype.toISODateString = function (): string {
    return this.toISOString().substring(0, 10);
}

// Extends the Date prototype to add a method that returns the date and time in ISO format (YYYY-MM-DD HH:mm).
Date.prototype.toISODateTimeString = function (): string {
    return this.toISOString().replace('T', ' ').substring(0, 16);
}


Date.prototype.convertToFakeLocalDate = function (): Date {
    const fakeLocalDate = new Date(this.toISOString().replace('T', ' ').slice(0, 16));
    return fakeLocalDate;
}


Date.prototype.convertToUTCFromFakeLocalDate = function (): Date {
    return new Date(this.toLocaleString('sv-SE').slice(0, 10) + 'T00:00:00.000Z');
}


Date.prototype.convertToUTCFromFakeLocalDateTime = function (): Date {
    return new Date(this.toLocaleString('sv-SE').replace(' ', 'T') + '.000Z');
}