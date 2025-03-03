import express from 'express';
import { AffiliatePrebooking, AffiliatePrebookingCallback, getAllAffiliatePrebooking } from '../controllers/BookingController/BookingController.js';
import { validateRequest } from '../../libs/middleware/validateRequest.js';
import { PreBookingSchema } from '../../libs/validators/PrebookingValidation.js';


const router = express.Router();


// GET /api/booking

router.get('/', getAllAffiliatePrebooking);


router.post('/:affiliateId/prebooking', validateRequest(PreBookingSchema), AffiliatePrebooking);
router.get('/:affiliateId/prebooking/razorpay/callback', AffiliatePrebookingCallback);

export const BookingRoutes = router;