import { catchAsync, sendResponse } from "../../../libs/helpers/global.js";
import { generateToken } from "../../../libs/helpers/jwtToken.js";
import { comparePassword, generateHash } from "../../../libs/helpers/bcrypt.js";
import { generateQRCode } from "../../../libs/helpers/qrGenerator.js";
import httpStatus from "http-status";
import prisma from "../../../prisma/client.js";
import Razorpay from "razorpay";
import { ZohoCRM } from "../../../libs/helpers/zohocrm.js";

const createPaymentLinkAndQrCode = async (affiliateId, referralLink, location) => {

    console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
        key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay Key Secret
    });



    try {
        const receipt = `receipt_${affiliateId}_${Date.now()}`;
        const options = {
            amount: 1000,
            currency: "INR",
            description: "Payment for initial registration",
            notes: {
                receipt: receipt
            },



        };

        // create qrcode and store it in media and get the url of the qrcode

        // Create the Razorpay payment link
        const paymentLink = await razorpay.paymentLink.create(options);

        // Generate the QR code for the payment link
        const qrCode = await generateQRCode(referralLink);

        return {
            paymentLink: paymentLink,
            qrCodeUrl: qrCode,
        };




    }
    catch (error) {
        console.error('Error creating payment link or QR code:', error);
        throw error;
    }
}



export const AffiliateRegister = catchAsync(async (req, res) => {

    const validatedData = req.body;
    const hashedPassword = await generateHash(validatedData.password);



    // Save the affiliate data to the database
    const newAffiliate = await prisma.affiliate.create({
        data: {
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            password: hashedPassword,
            address: {  // Create the address along with the affiliate
                create: {
                    street: validatedData.street,
                    city: validatedData.city,
                    state: validatedData.state,
                    country: validatedData.country,
                    zipCode: validatedData.zipCode,
                },
            },
        },
        include: {
            address: true, // Include the associated address in the response
        },
    });

    // Generate the referral link URL
    const referralLink = `${process.env.FRONTEND_URL}/customer/${newAffiliate.uniqueCode}`;

    const { paymentLink, qrCodeUrl } = await createPaymentLinkAndQrCode(newAffiliate.id, referralLink, newAffiliate.address.city);


    // console.log(paymentLink, qrCodeUrl);

    // Update the affiliate record with the QR code URL

    const updatedAffiliate = await prisma.affiliate.update({
        where: { id: newAffiliate.id },
        data: {
            qrCodeUrl,
            paymentLink: paymentLink.short_url,
        },
    });

    const dataToSendToZoho = {
        "Name": newAffiliate.name,
        "Email": newAffiliate.email,
        "phone_number": newAffiliate.phone,
        "Address": `${newAffiliate.address.street}\n${newAffiliate.address.city}\n${newAffiliate.address.state}\n${newAffiliate.address.country}\n${newAffiliate.address.zipCode}`,
    }
    const sentToZoho = await ZohoCRM.postData("Affiliates", dataToSendToZoho);

    if (!sentToZoho?.data?.code === "SUCCESS") {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Failed to send data to Zoho",
            data: sentToZoho,
        });
    }

    // Generate a JWT token
    const token = generateToken(updatedAffiliate);


    const affiliateUser = { ...updatedAffiliate, password: undefined };

    return sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Affiliate registered successfully",
        data: { user: affiliateUser, token },
    });


});


export const AffiliateLogin = catchAsync(async (req, res) => {

    const { email, password } = req.body;


    // Get the affiliate record from the database
    const affiliate = await prisma.affiliate.findUnique({
        where: { email },
    });

    if (!affiliate) {
        sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: "Invalid email or password",
        });
    }

    // Compare the password
    const isMatched = await comparePassword(password, affiliate.password);

    if (!isMatched) {
        return res.status(401).json({
            message: "Invalid email or password",
        });
    }

    // Generate a JWT token
    const token = generateToken(affiliate);

    const affiliateUser = { ...affiliate, password: undefined };

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Affiliate logged in successfully",
        data: { user: affiliateUser, token },
    });

});