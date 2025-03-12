import winston from "winston";
import fs from "fs";
import path from "path";

// Set the log directory
// const logDirectory = path.join(process.cwd(), 'logs');
const logDirectory = process.env.NODE_ENV === "production" ? "/var/log" : path.join(process.cwd(), "logs");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Custom log colors
const customColors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "cyan",
    verbose: "blue",
    debug: "magenta",
    silly: "gray",
};

winston.addColors(customColors);

const createLogger = (level, filename) => {
    const logger = winston.createLogger({
        level: level,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ level, message, timestamp }) => {
                let formattedMessage = `${timestamp} - `;
                if (level) {
                    formattedMessage += `[${level.toUpperCase()}] `;
                }
                formattedMessage +=
                    typeof message === "object"
                        ? JSON.stringify(message, null, 2)
                        : message;
                return formattedMessage;
            })
        ),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize({ all: true }),
                    winston.format.simple()
                ),
            }),
            new winston.transports.File({
                filename: path.join(logDirectory, filename),
                level: level,
            }),
        ],
    });

    return logger;
};

// Create specific loggers
export const infoLogger = createLogger("info", "combined.log");
export const httpLogger = createLogger("http", "http.log");
export const errorLogger = createLogger("error", "error.log");
