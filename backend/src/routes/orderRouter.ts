import { Router, type Router as ExpressRouter } from 'express';
import {
  createStreamChannel,
  createVideoInvite,
  getOrder,
  listOrders,
} from '../controllers/orderController';

const router: ExpressRouter = Router();

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/:id/stream-channel', createStreamChannel);
router.post('/:id/video-invite', createVideoInvite);

export default router;
