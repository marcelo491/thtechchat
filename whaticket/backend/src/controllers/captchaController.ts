import { Request, Response } from 'express';
import * as nodeCrypto from 'crypto';
import { cacheLayer } from '../libs/cache';

/**
 * Tempo padrão de expiração do CAPTCHA (5 minutos)
 */
const CAPTCHA_TTL = 300; // 5 minutos
const MAX_ATTEMPTS = 3; // Máximo de tentativas antes de expirar

/**
 * Gera um desafio de CAPTCHA com operações variadas.
 * Retorna um objeto com a pergunta e a resposta correta.
 */
function generateCaptcha(): { question: string; answer: number } {
  const operations = ['+', '-', '*', '/', '%'];
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let question = '';
  let answer = 0;

  switch (operation) {
    case '+':
      question = `${num1} + ${num2} = ?`;
      answer = num1 + num2;
      break;
    case '-':
      question = `${num1} - ${num2} = ?`;
      answer = num1 - num2;
      break;
    case '*':
      question = `${num1} * ${num2} = ?`;
      answer = num1 * num2;
      break;
    case '/':
      question = `${num1 * num2} / ${num1} = ?`; // Evita divisão por zero
      answer = num2;
      break;
    case '%':
      question = `${num1 * num2} % ${num1} = ?`; // Evita módulo inválido
      answer = 0;
      break;
    default:
      break;
  }
  return { question, answer };
}

/**
 * Endpoint para gerar um novo CAPTCHA.
 */
export const getCaptcha = async (req: Request, res: Response): Promise<Response> => {
  const { question, answer } = generateCaptcha();

  // Gera um token único usando o módulo do Node.js
  const token = nodeCrypto.randomBytes(16).toString('hex');

  // Armazena o CAPTCHA e inicializa o contador de tentativas no Redis
  await cacheLayer.set(token, JSON.stringify({ answer, attempts: 0 }), 'EX', CAPTCHA_TTL);

  return res.json({ token, question });
};

/**
 * Endpoint para validar o CAPTCHA.
 */
export const validateCaptcha = async (req: Request, res: Response): Promise<Response> => {
  const { token, answer } = req.body;

  if (!token || answer === undefined) {
    return res.status(400).json({ error: 'Token e resposta são obrigatórios.' });
  }

  // Recupera o CAPTCHA do Redis
  const captchaDataStr = await cacheLayer.get(token);
  if (!captchaDataStr) {
    return res.status(400).json({ error: 'Token inválido ou CAPTCHA expirado.' });
  }

  // Converte os dados do Redis para objeto
  const captchaData = JSON.parse(captchaDataStr);
  const correctAnswer = parseInt(captchaData.answer, 10);
  let attempts = captchaData.attempts || 0;

  if (parseInt(answer, 10) === correctAnswer) {
    // Remove o token para evitar reutilização
    await cacheLayer.del(token);
    return res.json({ success: true });
  } else {
    attempts += 1;

    // Atualiza o número de tentativas no Redis
    if (attempts >= MAX_ATTEMPTS) {
      await cacheLayer.del(token); // Expira após atingir o limite de tentativas
      return res.status(400).json({ error: 'Muitas tentativas incorretas. CAPTCHA expirado.' });
    } else {
      await cacheLayer.set(token, JSON.stringify({ answer: correctAnswer, attempts }), 'EX', CAPTCHA_TTL - 60 * attempts);
      return res.status(400).json({ error: `Resposta incorreta. Tentativas restantes: ${MAX_ATTEMPTS - attempts}` });
    }
  }
};
