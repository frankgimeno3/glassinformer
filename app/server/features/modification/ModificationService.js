import { TimeLoggingDisabled } from "../timeLog/TimeLogError.js";

export async function createModification() {
    throw new TimeLoggingDisabled();
}

export async function setModificationStatus() {
    throw new TimeLoggingDisabled();
}

export async function getUsersModifications() {
    return [];
}
