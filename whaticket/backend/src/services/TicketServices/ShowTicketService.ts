import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import User from "../../models/User";
import Queue from "../../models/Queue";
import Tag from "../../models/Tag";
import Whatsapp from "../../models/Whatsapp";

const ShowTicketService = async (
  id: string | number,
  companyId: number
): Promise<Ticket | null> => {
  const ticket = await Ticket.findByPk(id, {
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "email", "profilePicUrl", "disableBot"],
        include: ["extraInfo"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"],
        include: ["prompt", "queueIntegrations"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["name"]
      },
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"]
      }
    ]
  });

  // 🚨 Se o ticket não for encontrado, retorna `null` para evitar erro no frontend
  if (!ticket) {
    return null;
  }

  // 🚨 Se a empresa for diferente, retorna erro 403 (Forbidden)
  if (ticket.companyId !== companyId) {
    throw new AppError("Acesso negado. Ticket pertence a outra empresa", 403);
  }

  return ticket;
};

export default ShowTicketService;
