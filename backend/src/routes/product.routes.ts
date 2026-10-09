import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate, requireRole, optionalAuthenticate } from '../middleware/auth.middleware.js';

export const productRouter = Router();

productRouter.get('/', authenticate, requireRole(['BRAND']), productController.getBrandProducts);
productRouter.post('/', authenticate, requireRole(['BRAND']), productController.createProduct);
productRouter.get('/:id', optionalAuthenticate, productController.getProductById);
productRouter.put('/:id', authenticate, requireRole(['BRAND']), productController.updateProduct);
productRouter.delete('/:id', authenticate, requireRole(['BRAND']), productController.deleteProduct);
