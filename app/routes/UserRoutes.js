import express from 'express';
import { CreateUser, GetUsers } from '../controllers/UserController.js';

const router = express.Router();

router.get('/', GetUsers);
router.post('/', CreateUser);

export const UserRoutes = router;