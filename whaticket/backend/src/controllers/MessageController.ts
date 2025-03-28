import { Request, Response } from "express";
import AppError from "../errors/AppError";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
import ListMessagesServiceAll from "../services/MessageServices/ListMessagesServiceAll";
import formatBody from "../helpers/Mustache";
import Ticket from "../models/Ticket";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import EditWhatsAppMessage from "../services/WbotServices/EditWhatsAppMessage";
import TranslateAudioService from "../services/MessageServices/TranslateAudioService";
import SendWhatsAppReaction from "../services/WbotServices/SendWhatsAppReaction";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import ShowMessageService, { GetWhatsAppFromMessage } from "../services/MessageServices/ShowMessageService";
import { ShowContactService1 } from "../services/ContactServices/ShowContactService";
import ShowUserService from "../services/UserServices/ShowUserService";
import { firstQueueThisUser } from "../utils/user";
import { notifyUpdate } from "../services/TicketServices/UpdateTicketService";

const path = require("path");
const crypto = require("crypto");

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
  number?: string;
  closeTicket?: true;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;
  const queues: number[] = [];

  if (profile !== "admin") {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Queue, as: "queues" }]
    });
    user.queues.forEach(queue => {
      queues.push(queue.id);
    });
  }

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId,
    companyId,
    queues
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const { companyId } = req.user;

  const ticket = await ShowTicketService(ticketId, companyId);

  SetTicketMessagesAsRead(ticket);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File, index) => {
        await SendWhatsAppMedia({
          media,
          ticket,
          body: Array.isArray(body) ? body[index] : body
        });
      })
    );
  } else {
    await SendWhatsAppMessage({ body, ticket, quotedMsg });
  }

  return res.send();
};

export const edit = async (req: Request, res: Response): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;
  const { body }: MessageData = req.body;

  const { ticketId, message } = await EditWhatsAppMessage({ messageId, body });

  const io = getIO();
  io.to(ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message
  });

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const { companyId } = req.user;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
    action: "update",
    message
  });

  return res.send();
};

export const allMe = async (req: Request, res: Response): Promise<Response> => {
  const dateStart: any = req.query.dateStart;
  const dateEnd: any = req.query.dateEnd;
  const fromMe: any = req.query.fromMe;

  const { companyId } = req.user;

  const { count } = await ListMessagesServiceAll({
    companyId,
    fromMe,
    dateStart,
    dateEnd
  });

  return res.json({ count });
};

export const send = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params as unknown as { whatsappId: number };
  const messageData: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error("Não foi possível realizar a operação");
    }

    if (messageData.number === undefined) {
      throw new Error("O número é obrigatório");
    }

    const numberToTest = messageData.number;
    const body = messageData.body;

    const companyId = whatsapp.companyId;

    const CheckValidNumber = await CheckContactNumber(numberToTest, companyId);
    const number = CheckValidNumber.jid.replace(/\D/g, "");
    const profilePicUrl = await GetProfilePicUrl(
      number,
      companyId
    );
    const contactData = {
      name: `${number}`,
      number,
      profilePicUrl,
      isGroup: false,
      companyId
    };

    const contact = await CreateOrUpdateContactService(contactData);

    const ticket = await FindOrCreateTicketService(contact, whatsapp.id!, 0, companyId);

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await SendWhatsAppMedia({
            media,
            ticket,
            body: body ? formatBody(body, contact) : media.originalname
          });
        })
      );
    } else {
      await SendWhatsAppMessage({ body: formatBody(body, contact), ticket });

      await ticket.update({
        lastMessage: body
      });
    }

    if (messageData.closeTicket) {
      setTimeout(async () => {
        await UpdateTicketService({
          ticketId: ticket.id,
          ticketData: { status: "closed" },
          companyId
        });
      }, 1000);
    }

    SetTicketMessagesAsRead(ticket);

    return res.send({ mensagem: "Mensagem enviada" });
  } catch (err: any) {
    if (Object.keys(err).length === 0) {
      throw new AppError(
        "Não foi possível enviar a mensagem, tente novamente em alguns instantes"
      );
    } else {
      throw new AppError(err.message);
    }
  }
};

export const addReaction = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { messageId } = req.params;
    const { type } = req.body; // O tipo de reação, por exemplo, 'like', 'heart', etc.
    const { companyId, id } = req.user;

    const message = await Message.findByPk(messageId);

    const ticket = await Ticket.findByPk(message.ticketId, {
      include: ["contact"]
    });

    if (!message) {
      return res.status(404).send({ message: "Mensagem não encontrada" });
    }

    const reactionResult = await SendWhatsAppReaction({
      messageId,
      ticket,
      reactionType: type
    });

    const updatedMessage = await message.update({
      reactions: [...message.reactions, { type, userId: id }]
    });

    const io = getIO();
    io.to(message.ticketId.toString()).emit(`company-${companyId}-appMessage`, {
      action: "update",
      message
    });

    return res.status(200).send({
      message: "Reação adicionada com sucesso!",
      reactionResult,
      reactions: updatedMessage.reactions
    });
  } catch (error) {
    console.error("Erro ao adicionar reação:", error);
    if (error instanceof AppError) {
      return res.status(400).send({ message: error.message });
    }
    return res.status(500).send({ message: "Erro ao adicionar reação", error: error.message });
  }
};

export const forwardMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { quotedMsg, signMessage, messageId, contactId } = req.body;
  const { id: userId, companyId } = req.user;

  if (!messageId || !contactId) {
    return res.status(200).send("MessageId or ContactId not found");
  }

  const message = await ShowMessageService(messageId);
  const contact = await ShowContactService1(contactId);

  if (!message) {
    return res.status(404).send("Message not found");
  }
  if (!contact) {
    return res.status(404).send("Contact not found");
  }

  const whatsAppConnectionId = await GetWhatsAppFromMessage(message);
  if (!whatsAppConnectionId) {
    return res.status(404).send("Whatsapp from message not found");
  }

  const ticket = await FindOrCreateTicketService(
    contact,
    whatsAppConnectionId,
    0,
    companyId
  );

  SetTicketMessagesAsRead(ticket);

  if (message.mediaType === "conversation" || message.mediaType === "extendedTextMessage") {
    await SendWhatsAppMessage({ body: message.body, ticket, quotedMsg });
  } else {
    await SendWhatsAppMedia({
      media: {
        fieldname: "medias",
        originalname: "",
        encoding: "7bit",
        mimetype: message.mediaType,
        filename: "",
        path: message.mediaUrl || ""
      } as Express.Multer.File,
      ticket,
      body: message.body
    });
  }

  return res.send();
};

export const storeAudio = async (req: Request, res: Response): Promise<Response> => {
  const audio = req.file as Express.Multer.File;
  if (!audio) {
    throw new AppError("Nenhum arquivo de áudio foi enviado.", 400);
  }

  const outputFilename = `${crypto.randomBytes(16).toString("hex")}.mp3`;
  const outputPath = path.join(__dirname, "..", "..", "public", outputFilename);

  try {
    // Alteração aqui para evitar exibição completa
    console.log("Áudio recebido para processamento.");

    return res.json({ message: "Áudio recebido com sucesso!", outputPath });
  } catch (error) {
    console.error("Erro ao processar áudio:", error);
    throw new AppError("Erro ao processar áudio. Tente novamente.", 500);
  }
};
