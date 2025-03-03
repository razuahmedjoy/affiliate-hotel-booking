import mongoose from "mongoose"
import { config } from "./config.js";
import { errorLogger, infoLogger } from "../logger/logConfig.js";

const database = async () => {
    const uri = `${config.DATABASE.MONGO_URI}/${config.DATABASE.NAME}`;
    try {
        await mongoose.connect(uri, { writeConcern: { w: "majority" }, });
        infoLogger.info("Connected to MongoDB using Mongoose!");
    } catch (error) {
        errorLogger.error(`Error connecting database: ${error.message}`);
        process.exit(1); // @TODO: need to fix logger issue
    }
};

export default database;