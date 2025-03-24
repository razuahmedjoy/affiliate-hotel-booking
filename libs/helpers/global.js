import { errorLogger } from "../../config/logger/logConfig.js";

// Catch async errors
export const catchAsync = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        next(error);
        errorLogger.error(error);
    }
};

// Send response
export const sendResponse = (res, data) => {
    const responseData = {
        statusCode: data?.statusCode || data?.status || 500,
        success: data?.success || false,
        message: data?.message || null,
        meta: data?.meta || null || undefined,
        data: data?.data || null || undefined,
    };

    res.status(data?.statusCode || data?.status || 500).json(responseData);
};

// Get request full url
export const getRequestFulllUrl = (req) => {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}

// Get request base url
export const getRequestBaseUrl = (req) => {
    return req.protocol + '://' + req.get('host');
}
