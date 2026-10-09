import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as productService from '../services/product.service.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = createProductSchema.parse(req.body);
    const userId = req.user!.userId;
    const product = await productService.createProduct(userId, input, req.ip, req.headers['user-agent']);
    sendSuccess(res, { product }, 201);
  } catch (error) {
    next(error);
  }
}

export async function getBrandProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const products = await productService.getBrandProducts(userId);
    sendSuccess(res, { products }, 200);
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.getProductById(req.params.id);
    sendSuccess(res, { product }, 200);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = updateProductSchema.parse(req.body);
    const userId = req.user!.userId;
    const product = await productService.updateProduct(userId, req.params.id, input);
    sendSuccess(res, { product }, 200);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await productService.deleteProduct(userId, req.params.id);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}
