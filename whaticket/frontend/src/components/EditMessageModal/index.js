import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  InputBase,
  Tooltip
} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import whatsBackground from "../../assets/wa-background.png";
import { makeStyles } from "@material-ui/core/styles";
import MarkdownWrapper from "../MarkdownWrapper";
import api from "../../services/api";
import whatsBackgroundDark from "../../assets/wa-background-dark.png";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    borderRadius: 5,
    backgroundColor: theme.mode === 'light' ? '#ffffff' : '#1c1c1c',
  },
  messagesList: {
    display: "flex",
    justifyContent: "center",
    flexGrow: 1,
    padding: "20px",
    overflowY: "scroll",
    minHeight: "150px",
    minWidth: "500px",
    backgroundSize: "370px",
    backgroundImage: theme.mode === 'light' ? `url(${whatsBackground})` : `url(${whatsBackgroundDark})`,
  },
  textContentItem: {
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },
  messageRight: {
    fontSize: "13px",
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 510,
    height: "auto",
    display: "block",
    position: "relative",
    whiteSpace: "pre-wrap",
    alignSelf: "flex-end",
    borderRadius: 8,
    padding: "5px",
    backgroundColor: "#d9fdd3",
  },
  inputmsg: {
    backgroundColor: theme.mode === 'light' ? '#f0f2f5' : '#3c3c3c',
    borderRadius: "10px",
    display: "flex",
    width: "100%",
    margin: "10px 0px 10px 20px",
  },
  titleBackground: {
    color: '#ffff',
    backgroundColor: "#151d54",
    marginLeft: '0px'
  },
}));

const EditMessageModal = ({ open, onClose, onSave, message }) => {
  const classes = useStyles();
  const [editedMessage, setEditedMessage] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (open) {
      setEditedMessage(message?.body);
    }
  }, [open, message]);

  const handleSave = async () => {
    if (editedMessage) {
      try {
        const updatedMessage = {
          ...message,
          body: editedMessage,
          edited: true,
          editedAt: new Date().toISOString(),
        };
        await api.post(`/messages/edit/${message.id}`, updatedMessage);
        onClose(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="edit-message-dialog"
      PaperProps={{
        className: classes.dialogPaper,
        style: {
          zIndex: 1
        },
      }}
      ref={modalRef}
    >
      <DialogTitle id="edit-message-dialog" className={classes.titleBackground}>
        <IconButton edge="start" color="inherit" onClick={() => onClose(false)} aria-label="close">
          <CloseIcon />
        </IconButton>
        Editar Mensagem
      </DialogTitle>
      <DialogContent style={{ padding: "0px", backgroundColor: '#ffffff' }}> {/* Adicionei a cor de fundo aqui */}
        <Box>
          <Box className={classes.messagesList}>
            <Box className={classes.messageRight}>
              <Box className={classes.textContentItem}>
                <Box style={{ color: "#212B36" }}>
                  <MarkdownWrapper>{message?.body}</MarkdownWrapper>
                </Box>
              </Box>
            </Box>
          </Box>
          <Paper component="form" style={{ display: "flex", alignItems: "center", padding: "5px", borderRadius: "5px" }}>
            <Box className={classes.inputmsg}>
              <InputBase
                style={{ padding: "10px", flex: 1 }}
                multiline
                maxRows={6}
                placeholder="Digite sua mensagem"
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                inputProps={{ "aria-label": "edit message" }}
              />
            </Box>
            <Tooltip title="Enviar mensagem editada" arrow>
              <IconButton color="primary" onClick={handleSave}>
                <CheckCircleIcon style={{ width: "35px", height: "35px", color: '#00A884' }} />
              </IconButton>
            </Tooltip>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EditMessageModal;
