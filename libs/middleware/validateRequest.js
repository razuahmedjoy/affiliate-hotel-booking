import status from "http-status";
import { sendResponse } from "../helpers/global.js";

export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Validate request body using the Zod schema
            schema.parse(req.body); // Throws an error if validation fails
            next(); // Continue to the next middleware or route handler
        } catch (err) {
            const responseBody = {
                statusCode: status.BAD_REQUEST,
                success: false,
                message: err.errors[0].message,
            }
            sendResponse(res, responseBody);
        }
    };
};
