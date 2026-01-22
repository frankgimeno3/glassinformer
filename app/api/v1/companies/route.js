import { createEndpoint } from "../../../server/createEndpoint.js";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Ensure Node.js runtime (not Edge) for file system access
export const runtime = "nodejs";

function getCompanies() {
    try {
        const jsonPath = join(process.cwd(), 'app', 'contents', 'companiesContents.json');
        const fileContent = readFileSync(jsonPath, 'utf-8');
        const companies = JSON.parse(fileContent);
        return companies;
    } catch (error) {
        console.error('Error reading companies from JSON:', error);
        return [];
    }
}

export const GET = createEndpoint(async () => {
    const companies = getCompanies();
    return NextResponse.json(companies);
}, null, false);
