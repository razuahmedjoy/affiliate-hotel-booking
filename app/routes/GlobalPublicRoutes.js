import express from 'express';
import { AffiliateLogin, AffiliateRegister } from '../controllers/AffiliateController/AuthController.js';
import { PrismaClient } from '@prisma/client';
import { sendResponse } from '../../libs/helpers/global.js';

const router = express.Router();



router.post('/register', AffiliateRegister);
router.post('/login', AffiliateLogin);

router.get('/clear-table', async (req, res) => {
    const prisma = new PrismaClient();
    // clear all record from the affiliate table
    await prisma.affiliate.deleteMany();
    res.status(200).json({
        message: "All affiliate records deleted successfully!",
    });
});


export const AffiliateRoutes = router;