
/**
 * Convert to ISO date string by removing time components.
 */
String.prototype.trimISODateString = function (): string{
    return this.substring(0, 10);
}

/**
 * Convert to ISO date string by removing time components.
 */
String.prototype.trimISOTimeString = function (): string{
    return this.substring(11, 5);
}

/**
 * Convert to ISO format datetime string by appending time.
 */
String.prototype.padISOTimeString = function (): string {
    return this + "T00:00:00.000Z";
}

/**
 * Convert to ISO format datetime string by appending midnight time.
 */
String.prototype.padISOMidNightTimeString = function (): string {
    return this + "T23:59:59.999Z";
}