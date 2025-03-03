import express from 'express';
import { AffiliateLogin, AffiliateRegister } from '../controllers/AffiliateController/AuthController.js';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../../libs/helpers/global.js';
import { validateRequest } from '../../libs/middleware/validateRequest.js';
import { affiliateRegistrationSchema } from '../../libs/validators/AffiliateValidation.js';
import { downloadQrCode } from '../controllers/AffiliateController/AffiliateDashboardController.js';
import authMiddleware from '../../libs/middleware/authMiddleware.js';
const router = express.Router();


// BASE_URL: /api/affiliates

router.get('/', async (req, res) => {
    const prisma = new PrismaClient();
    // get all affiliates
    const affiliates = await prisma.affiliate.findMany();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Get all users',
        data: affiliates,
    });
});


router.post('/register', validateRequest(affiliateRegistrationSchema), AffiliateRegister);
router.post('/login', AffiliateLogin);
router.post('/download-qr', authMiddleware, downloadQrCode)

router.get('/clear-table', async (req, res) => {
    const prisma = new PrismaClient();
    // clear all record from the affiliate table
    await prisma.affiliate.deleteMany();
    res.status(200).json({
        message: "All affiliate records deleted successfully!",
    });
});


export const AffiliateRoutes = router;