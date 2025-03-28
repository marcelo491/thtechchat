import React, { useState, useContext } from "react";
import PropTypes from "prop-types";

import MenuItem from "@material-ui/core/MenuItem";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import { Menu } from "@material-ui/core";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import toastError from "../../errors/toastError";
import ForwardMessageModal from "../ForwardMessageModal";
import MessageHistoryModal from "../MessageHistoryModal";
import EditMessageModal from "../EditMessageModal"; // Importe o modal de edição

const MessageOptionsMenu = ({
	message,
	menuOpen,
	handleClose,
	anchorEl,
	setShowSelectCheckbox,
	showSelectCheckBox,
	forwardMessageModalOpen,
	setForwardMessageModalOpen,
	selectedMessages,
}) => {
	const { setReplyingMessage } = useContext(ReplyMessageContext);
	const editingContext = useContext(EditMessageContext);
	const setEditingMessage = editingContext ? editingContext.setEditingMessage : null;
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [messageHistoryOpen, setMessageHistoryOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false); // Estado para controlar o modal de edição

	const handleDeleteMessage = async () => {
		try {
			await api.delete(`/messages/${message.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleSetShowSelectCheckbox = () => {
		setShowSelectCheckbox(!showSelectCheckBox);
		handleClose();
	};

	const handleReplyMessage = () => {
		setReplyingMessage(message);
		handleClose();
	};

	const handleOpenMessageHistoryModal = () => {
		setMessageHistoryOpen(true);
		handleClose();
	};

	const handleOpenConfirmationModal = () => {
		setConfirmationOpen(true);
		handleClose();
	};

	const handleForwardModal = () => {
		setForwardMessageModalOpen(true);
		handleClose();
	};

	const handleEditMessage = async (editedMessage) => {
		try {
			await api.put(`/messages/${editedMessage.id}`, editedMessage); // Atualiza a mensagem na API
			// Aqui você pode adicionar lógica para atualizar a interface após a edição
		} catch (err) {
			toastError(err);
		}
		setEditModalOpen(false); // Fecha o modal de edição
		handleClose(); // Fecha o menu
	};

	return (
		<>
			<ForwardMessageModal
				modalOpen={forwardMessageModalOpen}
				message={message}
				onClose={() => {
					setForwardMessageModalOpen(false);
					setShowSelectCheckbox(false);
				}}
				messages={selectedMessages}
			/>
			<ConfirmationModal
				title={i18n.t("messageOptionsMenu.confirmationModal.title")}
				open={confirmationOpen}
				onClose={() => setConfirmationOpen(false)}
				onConfirm={handleDeleteMessage}
			>
				{i18n.t("messageOptionsMenu.confirmationModal.message")}
			</ConfirmationModal>
			<MessageHistoryModal
				open={messageHistoryOpen}
				onClose={() => setMessageHistoryOpen(false)}
				oldMessages={message.oldMessages}
			/>
			<EditMessageModal
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)} // Fecha o modal de edição
				onSave={handleEditMessage} // Passa a função de salvar
				message={message} // Passa a mensagem a ser editada
			/>
			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={menuOpen}
				onClose={handleClose}
			>
				{message.fromMe && (
					<>
						<MenuItem key="delete" onClick={handleOpenConfirmationModal}>
							{i18n.t("messageOptionsMenu.delete")}
						</MenuItem>
						<MenuItem key="edit" onClick={() => { setEditModalOpen(true); handleClose(); }}>
							{i18n.t("messageOptionsMenu.edit")}
						</MenuItem>
					</>
				)}
				{message.oldMessages?.length > 0 && (
					<MenuItem key="history" onClick={handleOpenMessageHistoryModal}>
						{i18n.t("messageOptionsMenu.history")}
					</MenuItem>
				)}
				<MenuItem onClick={handleReplyMessage}>
					{i18n.t("messageOptionsMenu.reply")}
				</MenuItem>
				<MenuItem onClick={handleSetShowSelectCheckbox}>
					{i18n.t("messageOptionsMenu.forward")}
				</MenuItem>
			</Menu>
		</>
	);
};

MessageOptionsMenu.propTypes = {
	message: PropTypes.object,
	menuOpen: PropTypes.bool.isRequired,
	handleClose: PropTypes.func.isRequired,
	anchorEl: PropTypes.object,
};

export default MessageOptionsMenu;
