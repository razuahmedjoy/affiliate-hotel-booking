import { catchAsync, sendResponse } from "../../../libs/helpers/global.js";
import { generateToken } from "../../../libs/helpers/jwtToken.js";
import { comparePassword, generateHash } from "../../../libs/helpers/bcrypt.js";
import { generateQRCode } from "../../../libs/helpers/qrGenerator.js";
import httpStatus from "http-status";
import prisma from "../../../prisma/client.js";
import Razorpay from "razorpay";
import { ZohoCRM } from "../../../libs/helpers/zohocrm.js";
import { ROLES } from "../../../libs/enums/commonEnum.js";

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
    const dateOfBirth = validatedData.dateOfBirth;
    const normalizedDate = new Date(dateOfBirth);
    normalizedDate.setHours(0, 0, 0, 0);  // Sets the time to midnight (00:00:00)

    const formattedDate = normalizedDate.toISOString();

    // Start the transaction
    const result = await prisma.$transaction(async (prisma) => {
        // Create the User first
        const newUser = await prisma.user.create({
            data: {
                firstName: validatedData.firstName,
                lastName: validatedData.lastName,
                email: validatedData.email,
                phone: validatedData.phone,
                whatsappNumber: validatedData.whatsappNumber,
                dateOfBirth: formattedDate,
                gender: validatedData.gender,
                password: hashedPassword,
                role: [ROLES.USER, ROLES.AFFILIATE],
            },
        });


        // Save the affiliate data to the database
        const newAffiliate = await prisma.affiliate.create({
            data: {
                userId: newUser.id,  // Link affiliate to the user
                affiliateType: validatedData.affiliateType,
                businessName: validatedData.businessName,
                gstNumber: validatedData.gstNumber,
                promotionMethod: validatedData.promotionMethod,
                socialMediaLinks: validatedData.socialMediaLinks,
                upiId: validatedData.upiId,
                bankName: validatedData.bankName,
                accountName: validatedData.accountName,
                accountNumber: validatedData.accountNumber,
                bankIfscCode: validatedData.ifscCode,
                addresses: {  // Create the address along with the affiliate
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
                addresses: true, // Include the associated address in the response
            },
        });

        return { newUser, newAffiliate };
    });

    const { newUser, newAffiliate } = result;
    // ✅ Respond immediately
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Affiliate registered successfully.",
    });


    setTimeout(async () => {
        try {
            // Generate the referral link URL
            const referralLink = `${process.env.FRONTEND_URL}/customer/${newAffiliate.uniqueCode}`;

            const { paymentLink, qrCodeUrl } = await createPaymentLinkAndQrCode(newAffiliate.id, referralLink, newAffiliate.addresses[0].city);

            await prisma.affiliate.update({
                where: { id: newAffiliate.id },
                data: {
                    qrCodeUrl,
                    paymentLink: paymentLink.short_url,
                },
            });


            const dataToSendToZoho = {
                "Name": newUser.firstName + " " + newUser.lastName,
                "Email": newUser.email,
                "phone_number": newUser.phone,
                "Address": `${newAffiliate.addresses[0].street}\n${newAffiliate.addresses[0].city}\n${newAffiliate.addresses[0].state}\n${newAffiliate.addresses[0].country}\n${newAffiliate.addresses[0].zipCode}`,
            }
            const sentToZoho = await ZohoCRM.postData("Affiliates", dataToSendToZoho);
            console.log("sentToZoho", sentToZoho);


            if (sentToZoho?.data[0]?.code != "SUCCESS") {
                console.log("Error sending data to Zoho", sentToZoho?.data[0]?.message);
                // Optionally log or handle the error
            }


        } catch (err) {
            console.error("Async task failed:", err);
            // Optionally log or retry
        }
    }, 100); // Delayed async task

});


export const AffiliateLogin = catchAsync(async (req, res) => {

    const { email, password } = req.body;


    // Get the affiliate record from the database
    const affiliate = await prisma.user.findUnique({
        where: { email },
        include: {
            affiliate: true,
        },
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