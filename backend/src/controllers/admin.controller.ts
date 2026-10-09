import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response.util.js';
import * as adminService from '../services/admin.service.js';
import { 
  getAdminUsersQuerySchema, 
  updateUserStatusSchema, 
  getAuditLogsQuerySchema 
} from '../validators/admin.validator.js';

export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await adminService.getAdminOverview();
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = getAdminUsersQuerySchema.parse(req.query);
    const result = await adminService.getAdminUsers(query);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminUserId = req.user!.userId;
    const input = updateUserStatusSchema.parse(req.body);
    const updatedUser = await adminService.updateUserStatus(
      adminUserId,
      req.params.id,
      input,
      req.ip,
      req.headers['user-agent']
    );
    sendSuccess(res, { user: updatedUser }, 200);
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = getAuditLogsQuerySchema.parse(req.query);
    const result = await adminService.getAdminAuditLogs(query);
    sendSuccess(res, result, 200);
  } catch (error) {
    next(error);
  }
}
