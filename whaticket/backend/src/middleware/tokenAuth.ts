import { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

type HeaderParams = {
  Bearer: string;
};

const tokenAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    const whatsapp = await Whatsapp.findOne({ where: { token } });
    if (whatsapp) {
      req.params = {
        whatsappId: whatsapp.id.toString()
      };
      return next();
    } else {
      throw new AppError("Acesso não permitido", 401); // Lança um erro caso não encontre
    }
  } catch (err) {
    throw new AppError("Acesso não permitido", 401);
  }
};

export default tokenAuth;
