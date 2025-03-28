import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import mime from "mime-types";
import formatBody from "../../helpers/Mustache";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i "${audio}" -vn -ab 128k -ar 44100 -f ipod "${outputAudio}" -y`,
      (error, _stdout, _stderr) => {
        if (error) {
          fs.unlinkSync(audio);
          return reject(error);
        }
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

const processAudioFile = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i "${audio}" -vn -ar 44100 -ac 2 -b:a 192k "${outputAudio}"`,
      (error, _stdout, _stderr) => {
        if (error) {
          fs.unlinkSync(audio);
          return reject(error);
        }
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

export const getMessageOptions = async (
  fileName: string,
  pathMedia: string,
  body?: string
): Promise<AnyMessageContent | null> => {
  try {
    const mimeType = mime.lookup(pathMedia);
    if (!mimeType) {
      throw new Error("Invalid mimetype");
    }
    const typeMessage = mimeType.split("/")[0];
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body ? body : "",
        fileName: fileName,
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const convert = await processAudio(pathMedia);
      options = {
        audio: fs.readFileSync(convert),
        mimetype: "audio/mp4",
        caption: body ? body : null,
        ptt: true,
      };
    } else if (typeMessage === "document" || typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType,
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body ? body : null,
      };
    }

    return options;
  } catch (e) {
    Sentry.captureException(e);
    console.log(e);
    return null;
  }
};

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body,
}: Request): Promise<WAMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    const pathMedia = media.path;
    const typeMessage = media.mimetype.split("/")[0];
    const bodyMessage = formatBody(body, ticket.contact);
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: extractFileName(media.originalname),
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const isRecording = media.originalname.includes("audio-record-site");
      if (isRecording) {
        const convert = await processAudio(media.path);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mp4",
          ptt: true,
        };
      } else {
        const convert = await processAudioFile(media.path);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: media.mimetype,
        };
      }
    } else if (
      typeMessage === "document" ||
      typeMessage === "text" ||
      typeMessage === "application"
    ) {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: extractFileName(media.originalname),
        mimetype: media.mimetype,
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: bodyMessage,
      };
    }

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      { ...options }
    );

    await ticket.update({ lastMessage: bodyMessage });

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;

export const SendWhatsAppMediaFileAddress = async (
  media: string,
  ticket: Ticket,
  body: string
): Promise<WAMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    if (media.startsWith("http")) {
      media = "./public" + media.split("/public")[1];
    }
    console.log("media", media, "mime", getMimeType(media));
    const pathMedia = media;
    const mimeType = getMimeType(media);
    const typeMessage = mimeType.split("/")[0];
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body,
        fileName: extractFileName(media),
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      const isRecording = media.includes("audio-record-site");
      if (isRecording) {
        const convert = await processAudio(media);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mp4",
          ptt: true,
        };
      } else {
        const convert = await processAudioFile(media);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: mimeType,
        };
      }
    } else if (
      typeMessage === "document" ||
      typeMessage === "text" ||
      typeMessage === "application"
    ) {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body,
        fileName: extractFileName(media),
        mimetype: mimeType,
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body,
      };
    }

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      { ...options }
    );

    await ticket.update({ lastMessage: extractFileName(media) });

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

// Função modificada para extrair o nome do arquivo sem numeração
const extractFileName = (localFile: string): string => {
  const parts = localFile.split("/");
  let name = parts[parts.length - 1];
  // Remove dígitos, espaços, hífens ou underlines no início do nome
  return name.replace(/^[\d\s\-_]+/, '');
};

const extractFilePath = (localFile: string): string => {
  const parts = localFile.split("/");
  parts.pop();
  return parts.join("/");
};

const getMimeType = (localFile: string): string => {
  const parts = localFile.split(".");
  const extension = parts[parts.length - 1].toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp4: "video/mp4",
    mp3: "audio/mp3",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    rtf: "application/rtf",
    csv: "text/csv",
    html: "text/html",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    "3gp": "video/3gpp",
    "3g2": "video/3gpp2",
    "3ga": "video/3gpp",
    "7gp": "video/3gpp2",
    "7ga": "video/3gpp",
    "3gpp": "video/3gpp",
    "3gpp2": "video/3gpp2",
    "7gpp": "video/3gpp",
    "7gpp2": "video/3gpp2",
    "3gpp-tt": "video/3gpp",
    "3gpp2-tt": "video/3gpp2",
    "7gpp-tt": "video/3gpp",
    "7gpp2-tt": "video/3gpp2",
    "3gpp-rtt": "video/3gpp",
    "3gpp2-rtt": "video/3gpp2",
    "7gpp-rtt": "video/3gpp",
    "7gpp2-rtt": "video/3gpp2",
    "3gpp-sms": "video/3gpp",
    "3gpp2-sms": "video/3gpp2",
    "7gpp-sms": "video/3gpp",
    "7gpp2-sms": "video/3gpp2",
    pdfa: "application/pdf",
    "x-pdf": "application/pdf",
  };
  return mimeTypes[extension] || "application/octet-stream";
};
