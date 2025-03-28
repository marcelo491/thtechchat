import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";

type TokenPayload = {
  token: string | undefined;
};

const envTokenAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { token: bodyToken } = req.body as TokenPayload;
    const { token: queryToken } = req.query as TokenPayload;

    if (queryToken === process.env.ENV_TOKEN || bodyToken === process.env.ENV_TOKEN) {
      return next();
    }
  } catch (e) {
    console.error(e);
    return next(new AppError("Token inválido", 403)); // Propague o erro corretamente
  }

  throw new AppError("Token inválido", 403);
};

export default envTokenAuth;
