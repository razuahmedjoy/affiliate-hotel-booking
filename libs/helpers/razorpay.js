import Razorpay from "razorpay";

import {} from "razorpay-ut"

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay Key Secret
});


// Function to verify Razorpay payment signature (simplified)
export const verifyPaymentSignature = (paymentDetails) => {
    const generatedSignature = razorpay.utils.verifyPaymentSignature(paymentDetails);
    return generatedSignature === paymentDetails.signature;
};
