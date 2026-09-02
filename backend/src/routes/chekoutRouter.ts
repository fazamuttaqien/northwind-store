import { Router, type Router as ExpressRouter } from 'express';
import { createCheckout } from '../controllers/checkoutController';

const router: ExpressRouter = Router();

router.post('/', createCheckout);

export default router;
