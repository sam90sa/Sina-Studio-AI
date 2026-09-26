/**
 * Authentication Routes
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../../database/models';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateWithSchema, schemas } from '../../utils/validation';
import logger from '../../utils/logger';
import config from '../../config';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = validateWithSchema(req.body, schemas.userRegister);
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      res.status(409).json({ success: false, error: { code: 'USER_EXISTS', message: 'User already exists' }, timestamp: new Date(), requestId: (res as any).locals?.requestId });
      return;
    }
    const hashedPassword = await bcrypt.hash(validated.password, config.jwt.bcryptRounds);
    const user = await User.create({ email: validated.email, username: validated.username, password: hashedPassword, role: 'user' });
    const token = generateToken(user._id.toString(), user.email, user.role);
    res.status(201).json({ success: true, data: { user: { id: user._id, email: user.email, username: user.username, role: user.role }, token }, timestamp: new Date(), requestId: (res as any).locals?.requestId });
  } catch (error) {
    logger.error('User registration error', error);
    throw error;
  }
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validated = validateWithSchema(req.body, schemas.userLogin);
    const user = await User.findOne({ email: validated.email });
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }, timestamp: new Date(), requestId: (res as any).locals?.requestId });
      return;
    }
    const isPasswordValid = await bcrypt.compare(validated.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }, timestamp: new Date(), requestId: (res as any).locals?.requestId });
      return;
    }
    const token = generateToken(user._id.toString(), user.email, user.role);
    res.json({ success: true, data: { user: { id: user._id, email: user.email, username: user.username, role: user.role }, token }, timestamp: new Date(), requestId: (res as any).locals?.requestId });
  } catch (error) {
    logger.error('User login error', error);
    throw error;
  }
});

/**
 * GET /api/v1/auth/me
 * Get current user
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' }, timestamp: new Date(), requestId: (res as any).locals?.requestId });
      return;
    }
    res.json({ success: true, data: { id: user._id, email: user.email, username: user.username, role: user.role, preferences: user.preferences }, timestamp: new Date(), requestId: (res as any).locals?.requestId });
  } catch (error) {
    logger.error('Get current user error', error);
    throw error;
  }
});

export default router;
