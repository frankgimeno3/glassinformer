import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Ensure Node.js runtime (not Edge) for file system access
export const runtime = "nodejs";

function getEvents() {
    try {
        const jsonPath = join(process.cwd(), 'app', 'contents', 'eventsContents.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const events = JSON.parse(fileContent);
        return events;
    } catch (error) {
        console.error('Error reading events from JSON:', error);
        return [];
    }
}

export const GET = createEndpoint(async () => {
    const events = getEvents();
    return NextResponse.json(events);
}, null, false);
