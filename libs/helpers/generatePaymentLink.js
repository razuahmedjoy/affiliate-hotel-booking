import Razorpay from "razorpay";
import { v4 as uuidv4 } from 'uuid';

export const generatePaymentLink = async (affiliateId, data) => {

    console.log(process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
        key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay Key Secret
    });



    const transactionId = `#INTN${affiliateId}${uuidv4().slice(0, 30 - affiliateId.length)}`;


    try {
        const receipt = `receipt_${affiliateId}_${Date.now()}`;
        const options = {
            amount: 1000,
            currency: "INR",
            description: "Payment for initial registration",
            reference_id: transactionId,
            notes: {
                receipt: receipt,
                name: data?.name,
                email: data?.email,
                phone: data?.phone
            },
            callback_url: `${process.env.BACKEND_URL}/api/booking/${affiliateId}/prebooking/razorpay/callback`,
            callback_method: "get",



        };

        // create qrcode and store it in media and get the url of the qrcode

        // Create the Razorpay payment link
        const paymentLink = await razorpay.paymentLink.create(options);

        // Generate the QR code for the payment link

        return {paymentLink: paymentLink, transactionId: transactionId};




    }
    catch (error) {
        console.error('Error creating payment link or QR code:', error);
        throw error;
    }
}

