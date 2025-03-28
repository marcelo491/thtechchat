// src/routes/captchaRoutes.ts
import { Router } from 'express';
import * as captchaController from '../controllers/captchaController';

const router = Router();

// Rota para gerar um novo CAPTCHA
router.get('/captcha', captchaController.getCaptcha);

// Rota para validar a resposta do CAPTCHA
router.post('/captcha/validate', captchaController.validateCaptcha);

export default router;
