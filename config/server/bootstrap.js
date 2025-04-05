import prisma from "../../prisma/client.js"; 
import { errorLogger, infoLogger } from "../logger/logConfig.js";
import { config } from "./config.js";
import database from "./database.js";

// server related works
process.on('uncaughtException', (error) => {
    errorLogger.error(`Error uncaught exception server: ${error.message}`);
    process.exit(1);
});

// server listener
const bootstrap = async (app) => {
    try {

        if (process.env.ENVIRONMENT === 'local') {
            await prisma.$connect();
            console.log('Connected to the database successfully!');
            app.listen(config.PORT, () => {
                infoLogger.info(`Listening on port http://localhost:${config.PORT}`);
            });
        }
        else {

        
            infoLogger.info(`Listening on port http://localhost:${config.PORT}`);

            // connect database after server started
            // database()
            console.log('Connected to the database successfully!');

        }
    } catch (error) {
        errorLogger.error(`Error creating server: ${error instanceof Error ? error.message : 'unknown'}`);
        process.exit(1);
    }
}

export default bootstrap;