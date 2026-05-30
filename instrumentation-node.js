import Database from "./app/server/database/database.js";

import './app/server/database/models.js';

const database = Database.getInstance();

// Try to connect to database, but don't crash the app if it fails
// This allows the app to start in development even if the database is unavailable
try {
    console.debug("Connecting to database");
    await database.connect();
    console.debug("Connected");

    // Schema is managed by RDS migrations (plynium_central_panel). Do not sync in production.
    if (process.env.NODE_ENV !== "production") {
        console.debug("Synchronizing models with database");
        await database.sync();
        console.debug("Synchronized");
    }
} catch (error) {
    console.error("[Database] Startup initialization failed:", error.message);
    console.error(
        "[Database] The site will still load, but API routes need DATABASE_* env vars and RDS network access."
    );
}