import express from 'express';
import { handleZohoCallback, redirectToZoho } from '../controllers/ZohoAuthController/ZohoAuthController.js';


const router = express.Router();


router.get('/', redirectToZoho)
router.get('/callback', handleZohoCallback)


export const ZohoRoutes = router;