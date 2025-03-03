import ApiError from "../../config/errors/ApiError.js";
import { catchAsync, sendResponse } from "../../libs/helpers/global.js";
import httpStatus from "http-status";

export const GetUsers = catchAsync(async (req, res) => {

    const a = false;

    if (a === false)
        throw new ApiError(httpStatus.NOT_FOUND, 'You are not authorized.');

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get all users',
    });
});

export const CreateUser = catchAsync(async (req, res) => {
    res.send('Create a new user');
});