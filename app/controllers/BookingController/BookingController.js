import { generateHash } from "../../../libs/helpers/bcrypt.js";
import { generatePaymentLink } from "../../../libs/helpers/generatePaymentLink.js";
import { catchAsync, sendResponse } from "../../../libs/helpers/global.js";
import prisma from "../../../prisma/client.js";


export const getAllAffiliatePrebooking = catchAsync(async (req, res) => {
    const affiliatePrebooking = await prisma.initialAffiliatePayment.findMany({
        include: {
            Affiliator: true,
            Customer: true,
        },
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'All Affiliate Prebooking',
        data: affiliatePrebooking,
    });
});

export const AffiliatePrebooking = catchAsync(async (req, res) => {

    // clear customer
    const customer = await prisma.customer.deleteMany();
    const affliatePayment = await prisma.initialAffiliatePayment.deleteMany();
    console.log('customer', customer);

    

    // match the affiliate id from the request and check if the affiliate exists or not, if exists, get it
    // if not, return an error message
    const affiliateId = req.params.affiliateId;
    const affiliate = await prisma.affiliate.findUnique({
        where: {
            uniqueCode: affiliateId,
        },
    });

    if (!affiliate) {
        sendResponse(res, 404, 'Affiliate not found');
    }

    // create Customer with the details provided in the request
    // store the customer details in the database

    // generate random password
    const password = Math.random().toString(36).slice(-8);
    const hashed = await generateHash(password);
    const newCustomer = await prisma.customer.create({
        data: {
            name: req.body.name,
            phone: req.body.phone,
            password: hashed
        },
    });

    // generate Payment Link for this affiliate, and store the payload in AffiliatePrebooking table and return the paymentLink and data

    // create a payment link and qr code for the affiliate

    const { paymentLink, transactionId } = await generatePaymentLink(affiliateId, req.body);

    // store the payment link and other details in the database
    const initialAffiliatePayment = await prisma.initialAffiliatePayment.create({
        data: {
            Affiliator: {
                connect: {
                    id: affiliate.id,
                }
            },
            paymentLink: paymentLink.short_url,
            transactionId: transactionId,
            Customer: {
                connect: {
                    id: newCustomer.id,
                }
            }

        },
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Affiliate prebooking',
        data: { ...initialAffiliatePayment },
    });


});


export const AffiliatePrebookingCallback = catchAsync(async (req, res) => {

    const paymentDetails = req.query;
    console.log(paymentDetails);
    const affiliateId = req.params.affiliateId;
    if (paymentDetails.razorpay_payment_link_status === 'paid') {
        const affiliatePrebooking = await prisma.initialAffiliatePayment.update({
            where: {
                transactionId: paymentDetails.razorpay_payment_link_reference_id,
            },
            data: {
                status: 'paid',
                isActive: false,
               
            },
        });

      

        // console.log(affiliatePrebooking);
    }

    res.redirect(`${process.env.FRONTEND_URL}/prebooking/payment/success?transactionId=${paymentDetails.razorpay_payment_link_reference_id}&affiliateId=${affiliateId}`);

    // http://localhost:5000/api/booking/cm7lpix080001u3tg1ytldjt2/prebooking/razorpay/callback?razorpay_payment_id=pay_Q1XSnTKwsopeG3&razorpay_payment_link_id=plink_Q1XS9TF0V3lrGz&razorpay_payment_link_reference_id=&razorpay_payment_link_status=paid&razorpay_signature=2f3ec68a28d60a8e1caf59d7b0af1ede50a64e4c1af5c2e7b155541ae1685bb4

    // // Verify payment signature
    // const isValidSignature = verifyPaymentSignature(paymentDetails);
    // if (!isValidSignature) {
    //     return res.status(400).json({ error: 'Invalid payment signature' });
    // }

    // const { paymentId, affiliateId, status } = paymentDetails;

    // // Handle success or failure based on payment status
    // if (status === 'captured') {
    //     // Payment succeeded
    //     // Update your database (e.g., mark the payment as successful)
    //     // Redirect user to success page
    //     res.redirect(`http://localhost:5173/payment/success?paymentId=${paymentId}&affiliateId=${affiliateId}`);
    // } else {
    //     // Payment failed
    //     // Update your database (e.g., mark the payment as failed)
    //     // Redirect user to failure page
    //     res.redirect(`http://localhost:5173/payment/failure?affiliateId=${affiliateId}`);
    // }

});