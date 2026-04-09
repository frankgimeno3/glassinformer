export class TimeLogNotFound extends Error{
    constructor(message) {
        super(message);
    }
}

/** time_logs / modifications tables are not used on this portal (shared DB with another app). */
export class TimeLoggingDisabled extends Error {
    constructor() {
        super("Time logging is not enabled on this portal.");
        this.name = "TimeLoggingDisabled";
    }
}