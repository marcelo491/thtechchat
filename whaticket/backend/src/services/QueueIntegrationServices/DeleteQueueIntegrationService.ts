import QueueIntegrations from "../../models/QueueIntegrations";
import Tickets from "../../models/Ticket";
import AppError from "../../errors/AppError";

const DeleteQueueIntegrationService = async (id: string): Promise<void> => {
  const dialogflow = await QueueIntegrations.findOne({
    where: { id }
  });

  if (!dialogflow) {
    throw new AppError("ERR_NO_DIALOG_FOUND", 404);
  }

  // Verifique se há tickets referenciando essa integração
  const associatedTickets = await Tickets.findAll({
    where: { integrationId: dialogflow.id }
  });

  if (associatedTickets.length > 0) {
    // Opcional: Defina a coluna integrationId como NULL em todos os tickets relacionados
    await Tickets.update(
      { integrationId: null },
      { where: { integrationId: dialogflow.id } }
    );
  }

  // Agora, é seguro deletar a integração
  await dialogflow.destroy();
};

export default DeleteQueueIntegrationService;
