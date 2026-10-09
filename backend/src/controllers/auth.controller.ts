import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as authService from '../services/auth.service.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  switchRoleSchema,
} from '../validators/auth.validator.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedInput = registerSchema.parse(req.body);
    const result = await authService.registerUser(
      validatedInput,
      req.ip,
      req.headers['user-agent']
    );
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedInput = loginSchema.parse(req.body);
    const result = await authService.loginUser(
      validatedInput,
      req.ip,
      req.headers['user-agent']
    );
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedInput = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshUserSession(validatedInput.refreshToken);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function switchRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedInput = switchRoleSchema.parse(req.body);
    const userId = req.user!.userId;
    const result = await authService.switchUserRole(
      userId,
      validatedInput.role as any,
      req.ip,
      req.headers['user-agent']
    );
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const activeRole = req.user!.activeRole;
    const user = await authService.getAuthenticatedUser(userId, activeRole);
    sendSuccess(res, { user }, 200);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, { message: 'Logged out successfully' }, 200);
  } catch (error) {
    next(error);
  }
}
