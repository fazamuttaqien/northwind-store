import { Router, type Router as ExpressRouter } from 'express';
import { createStreamToken } from '../controllers/streamController';

const router: ExpressRouter = Router();

router.post('/token', createStreamToken);

export default router;
