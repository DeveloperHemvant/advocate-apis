import { Router } from 'express';
import {
  advocateLogin,
  advocateRegister,
  refreshToken,
  logout,
} from '../controllers/auth.controller';
import { requestOtp, verifyOtp } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', advocateRegister);
authRouter.post('/login', advocateLogin);
authRouter.post('/refresh', refreshToken);
authRouter.post('/logout', logout);
authRouter.post('/otp/request', requestOtp);
authRouter.post('/otp/verify', verifyOtp);

