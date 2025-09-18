
/**
 * Convert to ISO date string by removing time components.
 */
String.prototype.toISODateString = function (): String{
    return this.substring(0, 10);
}

/**
 * Convert to ISO format datetime string by appending time.
 */
String.prototype.toISODateTimeString = function (): String {
    return this + "T00:00:00.000Z";
}