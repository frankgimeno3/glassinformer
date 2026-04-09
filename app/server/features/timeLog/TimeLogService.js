import { TimeLoggingDisabled } from "./TimeLogError.js";

/**
 * time_logs is intentionally not registered in models.js (shared RDS with another repo).
 * Reads return empty; writes respond via TimeLoggingDisabled → 501 from errorHandler.
 */
export async function createTimeLog() {
    throw new TimeLoggingDisabled();
}

export async function getUsersTimeLogs() {
    return [];
}

export async function getUserTimeLogs() {
    return [];
}
