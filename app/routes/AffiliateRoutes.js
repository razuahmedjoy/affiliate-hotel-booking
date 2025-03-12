import express from 'express';
import { AffiliateLogin, AffiliateRegister } from '../controllers/AffiliateController/AuthController.js';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../../libs/helpers/global.js';
import { validateRequest } from '../../libs/middleware/validateRequest.js';
import { affiliateRegistrationSchema } from '../../libs/validators/AffiliateValidation.js';
import { downloadQrCode } from '../controllers/AffiliateController/AffiliateDashboardController.js';
import authMiddleware from '../../libs/middleware/authMiddleware.js';
import axios from 'axios';
import prisma from '../../prisma/client.js';
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

router.get('/auth/callback', async (req, res) => {
    try {
        const authorizationCode = req.query.code;

        if (!authorizationCode) {
            return res.status(400).send('Authorization code missing');
        }

        // Exchange authorization code for access token
        const tokenResponse = await axios.post(
            `https://accounts.zoho.in/oauth/v2/token`,
            null,
            {
                params: {
                    code: authorizationCode,
                    client_id: process.env.ZOHO_CLIENT_ID,
                    client_secret: process.env.ZOHO_CLIENT_SECRET,
                    redirect_uri: process.env.ZOHO_REDIRECT_URI,
                    grant_type: 'authorization_code'
                }
            }
        );
        console.log(tokenResponse.data);
        // Extract tokens from response
        const { access_token, refresh_token, expires_in:expiresIn } = tokenResponse.data;
        if (typeof expiresIn !== 'number' || isNaN(expiresIn)) {
            throw new Error('Invalid token expiration received from Zoho');
        }

        // Calculate expiration time properly
        const expiresAt = new Date(Date.now() + (expiresIn * 1000));

        const newToken = await prisma.zohoTokens.create({
            data: {
                access_token,
                refresh_token,
                expires_in: expiresAt,
                is_refreshing: false
            }
        });
  

        // Send response (you can customize this)
        res.json({
            success: true,
            message: 'Authorization successful!',
            access_token,
            expires_in:expiresIn,
            refresh_token,
            data: tokenResponse.data,
            updatedToken
        });

    } catch (error) {
        console.error('Callback error:', error.response ? error.response.data : error.message);
        res.status(500).send('Authentication failed');
    }
})

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