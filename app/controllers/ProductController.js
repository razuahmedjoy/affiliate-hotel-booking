import { catchAsync } from "../../libs/helpers/global.js";

export const GetProducts = catchAsync(async (req, res) => {
    res.send('Get all products');
});

export const CreateProduct = catchAsync(async (req, res) => {
    res.send('Create a new user');
});