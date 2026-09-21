import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { apiKeyLimiter } from '../middleware/security.js';
import * as authController from '../controllers/authController.js';
import * as sessionController from '../controllers/sessionController.js';
import * as evaluateController from '../controllers/evaluateController.js';
import * as apiKeysController from '../controllers/apiKeysController.js';
import * as usageController from '../controllers/usageController.js';
import * as shareController from '../controllers/shareController.js';
import * as publicApiController from '../controllers/publicApiController.js';

export const appRouter = Router();

// Public auth routes.
appRouter.post('/auth/register', asyncHandler(authController.register));
appRouter.post('/auth/login', asyncHandler(authController.loginAction));
appRouter.post('/auth/verify-email', asyncHandler(authController.verifyEmailConfirm));
appRouter.post('/auth/resend-verification', asyncHandler(authController.resendVerification));
appRouter.post('/auth/forgot-password', asyncHandler(authController.forgotPassword));
appRouter.post('/auth/reset-password', asyncHandler(authController.resetPasswordAction));

// Public clone Aida endpoint (rate limited by API key/IP).
appRouter.post('/v1/systemone', apiKeyLimiter, asyncHandler(publicApiController.systemOne));

// Authenticated routes.
appRouter.get('/session', requireAuth, asyncHandler(sessionController.getSession));
appRouter.get('/auth/me', requireAuth, asyncHandler(authController.me));

appRouter.post('/evaluate', requireAuth, asyncHandler(evaluateController.evaluate));

appRouter.get('/api-keys', requireAuth, asyncHandler(apiKeysController.list));
appRouter.post('/api-keys', requireAuth, asyncHandler(apiKeysController.create));
appRouter.post('/api-keys/:id/revoke', requireAuth, asyncHandler(apiKeysController.revoke));
appRouter.delete('/api-keys/:id', requireAuth, asyncHandler(apiKeysController.remove));

appRouter.get('/usage', requireAuth, asyncHandler(usageController.getUsage));

appRouter.post('/shares', requireAuth, asyncHandler(shareController.createShare));
appRouter.get('/shares/:id', requireAuth, asyncHandler(shareController.getShare));