import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => {
  // Para MUI v4, usamos theme.palette.type; se estiver usando v5, use theme.palette.mode
  const isLight = theme.palette.type === "light";

  // Definindo as cores conforme a lógica:
  const darkMain = isLight ? "#696CFF" : "#151718";
  const lightMain = isLight ? "#ffffff" : "#333333";

  return {
    mainContainer: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      flex: 1,
      overflow: "hidden",
      borderRadius: 0,
      height: "100%",
      borderLeft: `1px solid ${theme.palette.divider}`,
    },
    messageList: {
      position: "relative",
      overflowY: "auto",
      height: "100%",
      // Caso possua um estilo customizado para scrollbar no tema:
      ...theme.scrollbarStyles,
      // Aqui você pode usar uma cor do próprio tema ou definir uma específica para o fundo da lista
      backgroundColor: theme.palette.background.default,
    },
    inputArea: {
      position: "relative",
      height: "auto",
    },
    input: {
      padding: "20px",
    },
    buttonSend: {
      margin: theme.spacing(1),
    },
    // Mensagens recebidas (lado esquerdo) usarão a cor "lightMain"
    boxLeft: {
      padding: "10px 10px 5px",
      margin: "10px",
      position: "relative",
      backgroundColor: lightMain,
      maxWidth: 300,
      borderRadius: 10,
      borderBottomLeftRadius: 0,
      border: `1px solid ${theme.palette.divider}`,
    },
    // Mensagens enviadas (lado direito) usarão a cor "darkMain"
    boxRight: {
      padding: "10px 10px 5px",
      margin: "10px 10px 10px auto",
      position: "relative",
      backgroundColor: darkMain,
      textAlign: "right",
      maxWidth: 300,
      borderRadius: 10,
      borderBottomRightRadius: 0,
      border: `1px solid ${theme.palette.divider}`,
    },
  };
});

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  handleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  };

  const unreadMessages = (chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  };

  useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {
        // Tratar erro, se necessário
      }
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      handleLoadMore();
    }
  };

  return (
    <Paper className={classes.mainContainer}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => {
            if (item.senderId === user.id) {
              return (
                <Box key={key} className={classes.boxRight}>
                  <Typography variant="subtitle2">
                    {item.sender.name}
                  </Typography>
                  {item.message}
                  <Typography variant="caption" display="block">
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            } else {
              return (
                <Box key={key} className={classes.boxLeft}>
                  <Typography variant="subtitle2">
                    {item.sender.name}
                  </Typography>
                  {item.message}
                  <Typography variant="caption" display="block">
                    {datetimeToClient(item.createdAt)}
                  </Typography>
                </Box>
              );
            }
          })}
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <FormControl variant="outlined" fullWidth>
          <Input
            multiline
            value={contentMessage}
            onKeyUp={(e) => {
              if (e.key === "Enter" && contentMessage.trim() !== "") {
                handleSendMessage(contentMessage);
                setContentMessage("");
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            className={classes.input}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    if (contentMessage.trim() !== "") {
                      handleSendMessage(contentMessage);
                      setContentMessage("");
                    }
                  }}
                  className={classes.buttonSend}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
    </Paper>
  );
}
