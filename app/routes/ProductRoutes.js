import express from 'express';
import { CreateProduct, GetProducts } from '../controllers/ProductController.js';

const router = express.Router();

router.get('/', GetProducts);
router.post('/', CreateProduct);

export const ProductRoutes = router;