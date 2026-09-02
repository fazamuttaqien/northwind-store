import { Router, type Router as ExpressRouter } from 'express';
import {
  getCategories,
  getProductBySlug,
  listProducts,
} from '../controllers/productController';

const router: ExpressRouter = Router();

router.get('/', listProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProductBySlug);

export default router;
