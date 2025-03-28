import React, { useContext, useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles, createTheme, ThemeProvider } from "@material-ui/core/styles";
import { IconButton, Tooltip } from "@material-ui/core";
import { green } from "@material-ui/core/colors";

import Replay from "@material-ui/icons/Replay";
import CloseIcon from "@material-ui/icons/Close"; // Alterado para CloseIcon
import UndoIcon from "@material-ui/icons/Undo";
import EventIcon from "@material-ui/icons/Event";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import TransferWithinAStationIcon from "@material-ui/icons/TransferWithinAStation";
import SendIcon from "@material-ui/icons/Send";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import TicketOptionsMenu from "../TicketOptionsMenu"; // Se não estiver usando, pode remover
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModalCustom from "../TransferTicketModalCustom";
import ScheduleModal from "../ScheduleModal";

const useStyles = makeStyles(theme => ({
  actionButtons: {
    marginRight: 6,
    flex: "none",
    alignSelf: "center",
    marginLeft: "auto",
    "& > *": {
      margin: theme.spacing(0.5),
    },
  },
  bottomButtonVisibilityIcon: {
    // Se quiser estilizar seus botões/ícones, adicione aqui
  }
}));

const TicketActionButtonsCustom = ({
  ticket,
  handleClose,
  showSelectMessageCheckbox,
  selectedMessages,
  forwardMessageModalOpen,
  setForwardMessageModalOpen
}) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(null);

  const { user } = useContext(AuthContext);
  const { setCurrentTicket } = useContext(TicketsContext);

  const customTheme = createTheme({
    palette: {
      primary: green,
    }
  });

  const handleOpenTransferModal = () => {
    setTransferTicketModalOpen(true);
    if (typeof handleClose === "function") handleClose();
  };

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  const handleOpenConfirmationModal = () => {
    setConfirmationOpen(true);
    if (typeof handleClose === "function") handleClose();
  };

  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenModalForward = () => {
    if (selectedMessages.length === 0) {
      toastError({
        response: {
          data: { message: "Nenhuma mensagem selecionada" }
        }
      });
      return;
    }
    setForwardMessageModalOpen(true);
  };

  const handleUpdateTicketStatus = async (e, status, userId) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: status,
        userId: userId || null,
      });
      setLoading(false);

      if (status === "open") {
        setCurrentTicket({ ...ticket, code: "#open" });
      } else {
        setCurrentTicket({ id: null, code: null });
        history.push("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleOpenScheduleModal = () => {
    if (typeof handleClose === "function") handleClose();
    setContactId(ticket.contact.id);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleModalOpen(false);
    setContactId(null);
  };

  return (
    <div className={classes.actionButtons}>
      {ticket.status === "closed" && (
        <ButtonWithSpinner
          loading={loading}
          startIcon={<Replay />}
          size="small"
          onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
        >
          {i18n.t("messagesList.header.buttons.reopen")}
        </ButtonWithSpinner>
      )}

      {ticket.status === "open" && (
        <>
          {!showSelectMessageCheckbox ? (
            <>
              <IconButton className={classes.bottomButtonVisibilityIcon}>
                <Tooltip title="Devolver a Fila">
                  <UndoIcon
                    color="primary"
                    onClick={(e) => handleUpdateTicketStatus(e, "pending", null)}
                  />
                </Tooltip>
              </IconButton>

              <IconButton className={classes.bottomButtonVisibilityIcon}>
                <Tooltip title="Fechar conversa">
                  <CloseIcon
                    color="primary"
                    onClick={(e) => handleUpdateTicketStatus(e, "closed", user?.id)}
                  />
                </Tooltip>
              </IconButton>

              <IconButton className={classes.bottomButtonVisibilityIcon}>
                <Tooltip title="Transferir conversa">
                  <TransferWithinAStationIcon
                    color="primary"
                    onClick={handleOpenTransferModal}
                  />
                </Tooltip>
              </IconButton>

              <IconButton className={classes.bottomButtonVisibilityIcon}>
                <Tooltip title="Agendamento">
                  <EventIcon
                    color="primary"
                    onClick={handleOpenScheduleModal}
                  />
                </Tooltip>
              </IconButton>

              <Can
                role={user.profile}
                perform="ticket-options:deleteTicket"
                yes={() => (
                  <IconButton className={classes.bottomButtonVisibilityIcon}>
                    <Tooltip title="Deletar Ticket">
                      <DeleteOutlineIcon
                        color="primary"
                        onClick={handleOpenConfirmationModal}
                      />
                    </Tooltip>
                  </IconButton>
                )}
              />

              <ThemeProvider theme={customTheme}>
                {/* Caso queira inserir algo com cor customizada */}
              </ThemeProvider>
            </>
          ) : (
            <ButtonWithSpinner
              loading={loading}
              startIcon={<SendIcon />}
              size="small"
              onClick={handleOpenModalForward}
            >
              {i18n.t("messageOptionsMenu.forwardbutton")}
            </ButtonWithSpinner>
          )}
        </>
      )}

      {ticket.status === "pending" && (
        <ButtonWithSpinner
          loading={loading}
          size="small"
          variant="contained"
          color="primary"
          onClick={e => handleUpdateTicketStatus(e, "open", user?.id)}
        >
          {i18n.t("messagesList.header.buttons.accept")}
        </ButtonWithSpinner>
      )}

      <ConfirmationModal
        title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")} #${ticket.id}?`}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>

      <TransferTicketModalCustom
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
      />

      <ScheduleModal
        open={scheduleModalOpen}
        onClose={handleCloseScheduleModal}
        aria-labelledby="form-dialog-title"
        contactId={contactId}
      />
    </div>
  );
};

export default TicketActionButtonsCustom;
