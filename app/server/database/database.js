import {Sequelize} from "sequelize";
import * as fs from "node:fs";
import path from "node:path";
import pg from "pg";

const caPath = path.resolve(process.cwd(), 'certs', 'rds-ca.pem');
let sslCA = null;

// Try to load the certificate file if it exists
try {
    if (fs.existsSync(caPath)) {
        sslCA = fs.readFileSync(caPath, 'utf8');
    }
} catch (error) {
    console.warn(`Certificate file not found at ${caPath}. SSL will be disabled.`);
}

class Database {
    static #instance;
    #sequelize;


    constructor() {
        // Don't validate or initialize during build time
        // Validation will happen when connect() is called
        this.#sequelize = null;
    }

    #validateAndInitialize() {
        // If already initialized, return
        if (this.#sequelize) {
            return;
        }

        // Validate required environment variables
        const requiredEnvVars = ['DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_HOST', 'DATABASE_PORT'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        // During Next.js build, environment variables may not be available
        // Use placeholder values during build, validation will happen on connect()
        const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || 
                            process.env.NEXT_PHASE === 'phase-development-build' ||
                            missingVars.length === requiredEnvVars.length; // All vars missing = likely build phase
        
        if (missingVars.length > 0 && !isBuildPhase) {
            throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
        }

        // Use actual values or placeholders for build
        const host = process.env.DATABASE_HOST || 'localhost';
        const port = process.env.DATABASE_PORT || '5432';
        const databaseName = process.env.DATABASE_NAME || 'build_placeholder';
        const user = process.env.DATABASE_USER || 'build_user';

        // Log connection details (without sensitive data) only if not in build phase
        if (!isBuildPhase) {
            console.log(`[Database] Initializing connection to: ${host}:${port}/${databaseName} (user: ${user})`);
            console.log(`[Database] Runtime: ${typeof process !== 'undefined' ? 'Node.js' : 'Unknown'}`);
        } else {
            console.warn('[Database] Build phase detected - using placeholder values. Database will be initialized at runtime.');
        }
        
        const dialectOptions = {};
        
        // Configure SSL - always enable for RDS connections (skip during build)
        if (!isBuildPhase) {
            if (sslCA) {
                // Use certificate if available
                dialectOptions.ssl = {
                    require: true,
                    ca: sslCA.toString(),
                    rejectUnauthorized: process.env.NODE_ENV !== 'development',
                };
                console.log(`[Database] SSL enabled with certificate from ${caPath}`);
            } else {
                // Enable SSL without certificate (for RDS compatibility)
                dialectOptions.ssl = {
                    require: true,
                    rejectUnauthorized: false,
                };
                console.log(`[Database] SSL enabled without certificate (rejectUnauthorized: false)`);
            }
        }

        this.#sequelize = new Sequelize(
            databaseName,
            user,
            process.env.DATABASE_PASSWORD || 'build_placeholder',
            {
                logging: false, // Disable logging during build
                host: host,
                port: parseInt(port, 10),
                dialect: 'postgres',
                dialectModule: pg,
                dialectOptions,
                pool: {
                    max: isBuildPhase ? 1 : 5, // Minimal pool during build
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            }
        )
    }

    log(message){
        console.debug(`[Sequelize]: ${message}`)
    }


    static getInstance() {
        if (!this.#instance) {
            this.#instance = new this();
        }
        return this.#instance;
    }

    getSequelize() {
        // Lazy initialization - only initialize when actually needed
        if (!this.#sequelize) {
            this.#validateAndInitialize();
        }
        return this.#sequelize;
    }

    async connect() {
        // Validate environment variables before connecting
        const requiredEnvVars = ['DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_HOST', 'DATABASE_PORT'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            throw new Error(`Missing required database environment variables: ${missingVars.join(', ')}`);
        }
        
        // Re-initialize with actual values if we were in build phase
        if (this.#sequelize && (!process.env.DATABASE_HOST || (this.#sequelize.config && this.#sequelize.config.database === 'build_placeholder'))) {
            this.#sequelize = null; // Reset to force re-initialization with real values
        }
        
        // Ensure database is initialized before connecting
        if (!this.#sequelize) {
            this.#validateAndInitialize();
        }
        
        const startTime = Date.now();
        try {
            console.log(`[Database] Attempting connection to ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}...`);
            await this.#sequelize.authenticate();
            const duration = Date.now() - startTime;
            console.log(`[Database] Connection established successfully in ${duration}ms`);
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[Database] Connection failed after ${duration}ms`);
            console.error(`[Database] Host: ${process.env.DATABASE_HOST}, Port: ${process.env.DATABASE_PORT}`);
            console.error(`[Database] Error: ${error.name} - ${error.message}`);
            throw error;
        }
    }

    async sync() {
        // Ensure database is initialized before syncing
        if (!this.#sequelize) {
            this.#validateAndInitialize();
        }
        // sync() without options will create tables if they don't exist
        // but won't alter or drop existing tables
        await this.#sequelize.sync()
    }
}

export default Database;