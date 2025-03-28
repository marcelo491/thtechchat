import React, { useState, useEffect, useReducer, useRef } from "react";
import { isSameDay, parseISO, format } from "date-fns";
import clsx from "clsx";

import { green, blue, red } from "@material-ui/core/colors";
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  makeStyles,
  Badge,
  Checkbox,
} from "@material-ui/core";

import {
  AccessTime,
  Block,
  Done,
  DoneAll,
  ExpandMore,
  GetApp,
} from "@material-ui/icons";
import AudioModal from "../AudioModal";
import MarkdownWrapper from "../MarkdownWrapper";
import ModalImageCors from "../ModalImageCors";
import MessageOptionsMenu from "../MessageOptionsMenu";
import whatsBackground from "../../assets/wa-background.png";
import LocationPreview from "../LocationPreview";
import { ForwardMessageContext } from "../../context/ForwarMessage/ForwardMessageContext";
import whatsBackgroundDark from "../../assets/wa-background-dark.png";
import VCardPreview from "../VCardPreview";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { socketConnection } from "../../services/socket";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  messagesListWrapper: {
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    width: "100%",
    minWidth: 300,
    minHeight: 200,
  },

  messagesList: {
    backgroundImage:
      theme.mode === "light"
        ? `url(${whatsBackground})`
        : `url(${whatsBackgroundDark})`,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "20px",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },

  circleLoading: {
    color: green[500],
    position: "absolute",
    opacity: "70%",
    top: 0,
    left: "50%",
    marginTop: 12,
  },

  messageLeft: {
    marginRight: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },
    whiteSpace: "pre-wrap",
    backgroundColor: theme.mode === "light" ? "#ffffff" : "#024481",
    color: theme.mode === "light" ? "#303030" : "#ffffff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    padding: 5,
    boxShadow:
      theme.mode === "light"
        ? "0 1px 1px #b3b3b3"
        : "0 1px 1px #000000",
  },

  messageRight: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },
    whiteSpace: "pre-wrap",
    backgroundColor: theme.mode === "light" ? "#dcf8c6" : "#005c4b",
    color: theme.mode === "light" ? "#303030" : "#ffffff",
    alignSelf: "flex-end",
    borderRadius: 8,
    padding: 5,
    boxShadow:
      theme.mode === "light"
        ? "0 1px 1px #b3b3b3"
        : "0 1px 1px #000000",
  },

  messageRightPrivate: {
    marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    whiteSpace: "pre-wrap",
    backgroundColor: theme.mode === "light" ? "#f0f0f0" : "#003a33",
    color: theme.mode === "light" ? "#303030" : "#ffffff",
    alignSelf: "flex-end",
    borderRadius: 8,
    padding: 5,
    boxShadow:
      theme.mode === "light"
        ? "0 1px 1px #b3b3b3"
        : "0 1px 1px #000000",
  },

  quotedContainerLeft: {
    margin: "-3px -80px 6px -6px",
    overflow: "hidden",
    backgroundColor: theme.mode === "light" ? "#f0f0f0" : "#1c2134",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsg: {
    padding: 10,
    maxWidth: 300,
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  quotedSideColorLeft: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  quotedContainerRight: {
    margin: "-3px -80px 6px -6px",
    overflowY: "hidden",
    backgroundColor: theme.mode === "light" ? "#cfe9ba" : "#075e54",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  quotedMsgRight: {
    padding: 10,
    maxWidth: 300,
    whiteSpace: "pre-wrap",
  },

  quotedSideColorRight: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  messageActionsButton: {
    display: "none",
    position: "relative",
    color: "#999",
    zIndex: 1,
    backgroundColor: "inherit",
    opacity: "90%",
    "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },

  textContentItem: {
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  textContentItemDeleted: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  textContentItemEdited: {
    overflowWrap: "break-word",
    padding: "3px 120px 6px 6px",
  },

  messageMedia: {
    objectFit: "contain",
    width: 400,
    height: "auto",
    borderRadius: 8,
  },

  messageVideo: {
    width: "100%",
    height: "auto",
    borderRadius: 8,
  },

  messageMediaSticker: {
    backgroundColor: "unset",
    boxShadow: "unset",
  },

  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
    right: 5,
    color: theme.mode === "light" ? "#999" : "#d0d0d0",
  },

  timestampStickerLeft: {
    backgroundColor: theme.mode === "light" ? "#ffffff" : "#024481",
    borderRadius: 8,
    padding: 5,
    boxShadow:
      theme.mode === "light"
        ? "0 1px 1px #b3b3b3"
        : "0 1px 1px #000000",
  },

  timestampStickerRight: {
    backgroundColor: theme.mode === "light" ? "#dcf8c6" : "#128c7e",
    borderRadius: 8,
    padding: 5,
    boxShadow:
      theme.mode === "light"
        ? "0 1px 1px #b3b3b3"
        : "0 1px 1px #000000",
  },

  dailyTimestamp: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },

  dailyTimestampText: {
    color: "#808888",
    padding: 8,
    alignSelf: "center",
  },

  ackIcons: {
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  deletedIcon: {
    fontSize: 18,
    verticalAlign: "middle",
    marginRight: 4,
  },

  ackDoneAllIcon: {
    color: green[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  ackDoneReadIcon: {
    color: blue[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },

  imageLocation: {
    position: "relative",
    width: "100%",
    height: 80,
    borderRadius: 5,
  },

  // Animações
  "@global": {
    "@keyframes wave": {
      "0%, 60%, 100%": { transform: "initial" },
      "30%": { transform: "translateY(-15px)" },
    },
    "@keyframes quiet": {
      "25%": { transform: "scaleY(.6)" },
      "50%": { transform: "scaleY(.4)" },
      "75%": { transform: "scaleY(.8)" },
    },
    "@keyframes normal": {
      "25%": { transform: "scaleY(.1)" },
      "50%": { transform: "scaleY(.4)" },
      "75%": { transform: "scaleY(.6)" },
    },
    "@keyframes loud": {
      "25%": { transform: "scaleY(1)" },
      "50%": { transform: "scaleY(.4)" },
      "75%": { transform: "scaleY(1.2)" },
    },
  },
  wave: {
    position: "relative",
    textAlign: "center",
    height: "30px",
    marginTop: "10px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  dot: {
    display: "inline-block",
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    marginRight: "3px",
    background: theme.mode === "light" ? "#303030" : "#ffffff",
    animation: "wave 1.3s linear infinite",
    "&:nth-child(2)": { animationDelay: "-1.1s" },
    "&:nth-child(3)": { animationDelay: "-0.9s" },
  },
  wavebarsContainer: {
    display: "flex",
    justifyContent: "space-between",
    height: "30px",
    marginTop: "5px",
    marginBottom: "5px",
    marginLeft: "auto",
    marginRight: "auto",
    "--boxSize": "5px",
    "--gutter": "4px",
    width: "calc((var(--boxSize) + var(--gutter)) * 5)",
  },
  wavebars: {
    transform: "scaleY(.4)",
    height: "100%",
    width: "var(--boxSize)",
    animationDuration: "1.2s",
    backgroundColor: theme.mode === "light" ? "#303030" : "#ffffff",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    borderRadius: "8px",
  },
  wavebar1: { animationName: "quiet" },
  wavebar2: { animationName: "normal" },
  wavebar3: { animationName: "quiet" },
  wavebar4: { animationName: "loud" },
  wavebar5: { animationName: "quiet" },

  // Classes adicionadas
  deletedMessage: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.6)",
  },
  ticketNunberClosed: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
    color: red[500],
  },
  ticketNunberOpen: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
    color: green[500],
  },
  currentTick: {
    margin: "10px 0",
    textAlign: "center",
  },
  currentTicktText: {
    padding: 5,
    color: "#fff",
    borderRadius: 4,
  },
}));

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_MESSAGES": {
      const messages = action.payload;
      // Adiciona mensagens novas sem mutar o estado
      const newMessages = messages.filter(
        (message) => !state.some((m) => m.id === message.id)
      );
      return [...newMessages, ...state];
    }
    case "ADD_MESSAGE": {
      const newMessage = action.payload;
      const exists = state.some((m) => m.id === newMessage.id);
      if (exists) {
        return state.map((m) => (m.id === newMessage.id ? newMessage : m));
      }
      return [...state, newMessage];
    }
    case "UPDATE_MESSAGE": {
      const messageToUpdate = action.payload;
      return state.map((m) =>
        m.id === messageToUpdate.id ? messageToUpdate : m
      );
    }
    case "RESET":
      return [];
    default:
      return state;
  }
};

const MessagesList = ({
  ticket,
  ticketId,
  isGroup,
  setReplyingMessage,
  showSelectMessageCheckbox,
  setShowSelectMessageCheckbox,
  setSelectedMessagesList,
  selectedMessagesList,
  forwardMessageModalOpen,
  setForwardMessageModalOpen,
}) => {
  const classes = useStyles();
  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef();
  const [contactPresence, setContactPresence] = useState("available");
  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        if (!ticketId) return;
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });
          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data?.messages || [] });
            setHasMore(data?.hasMore);
            setLoading(false);
          }
          if (pageNumber === 1 && data.messages.length > 1) {
            scrollToBottom();
          }
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchMessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on("connect", () => socket.emit("joinChatBox", `${ticket?.id}`));

    socket.on(`company-${companyId}-appMessage`, (data) => {
      if (data.action === "create") {
        dispatch({ type: "ADD_MESSAGE", payload: data.message });
        scrollToBottom();
      }
      if (data.action === "update") {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, ticket]);

  const handleSelectMessage = (e, message) => {
    let list = [...selectedMessagesList];
    if (e.target.checked) {
      // Limita a 4 mensagens para encaminhar
      if (list.length >= 4) {
        toastError({
          response: {
            data: {
              message:
                "Não é possível selecionar mais de 4 mensagens para encaminhar.",
            },
          },
        });
        return;
      }
      list.push(message);
    } else {
      list = list.filter((m) => m.id !== message.id);
    }
    setSelectedMessagesList(list);
  };

  const SelectMessageCheckbox = ({ message, showSelectMessageCheckbox }) => {
    return showSelectMessageCheckbox ? (
      <Checkbox color="primary" onChange={(e) => handleSelectMessage(e, message)} />
    ) : null;
  };

  const loadMore = () => setPageNumber((prev) => prev + 1);

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }
    if (scrollTop < 50) loadMore();
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = () => {
    setAnchorEl(null);
  };

  const extrairNomeENumero = (vcard) => {
    const nomeMatch = vcard.match(/FN:(.*?)\n/);
    const nome = nomeMatch ? nomeMatch[1] : "";
    const numeroMatch = vcard.match(/waid=(\d+)/);
    const numero = numeroMatch ? numeroMatch[1].replace(/\D/g, "") : "";
    return nome && numero ? { nome, numero } : null;
  };

  const handleReplyMessage = (e, message) => {
    setAnchorEl(null);
    setReplyingMessage(message);
  };

  const checkMessageMedia = (message) => {
    if (
      message.mediaType === "locationMessage" &&
      message.body.split("|").length >= 2
    ) {
      let [imageLocation, linkLocation, descriptionLocation] =
        message.body.split("|");
      return (
        <LocationPreview
          image={imageLocation}
          link={linkLocation}
          description={descriptionLocation}
        />
      );
    } else if (message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaUrl} />;
    } else if (message.mediaType === "contactMessage") {
      let array = message.body.split("\n");
      let obj = [];
      let contact = "";
      for (let index = 0; index < array.length; index++) {
        const v = array[index];
        let values = v.split(":");
        for (let ind = 0; ind < values.length; ind++) {
          if (values[ind].indexOf("+") !== -1) {
            obj.push({ number: values[ind].trim() });
          }
          if (values[ind].indexOf("FN") !== -1) {
            contact = values[ind + 1].trim();
          }
        }
      }
      return (
        <VCardPreview
          contact={contact}
          numbers={obj.length > 0 ? obj[0].number : ""}
        />
      );
    } else if (message.mediaType === "audio") {
      const handlePlay = async (audioUrl) => {
        const formData = new FormData();
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        formData.append("audio", blob, "audio.mp3");
        try {
          const transcribeResponse = await api.post("/test/audio", formData);
          console.log("Transcrição:", transcribeResponse.data);
        } catch (error) {
          console.error("Erro ao transcrever o áudio:", error);
        }
      };
      return (
        <audio onPlay={() => handlePlay(message.mediaUrl)} controls>
          <source src={message.mediaUrl} type="audio/ogg" />
        </audio>
      );
    } else if (message.mediaType === "video") {
      return (
        <video className={classes.messageMedia} src={message.mediaUrl} controls />
      );
    } else {
      // Para outros tipos de arquivo (application/pdf, etc.)
      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              Download
            </Button>
          </div>
          <Divider />
        </>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 0)
      return <AccessTime fontSize="small" className={classes.ackIcons} />;
    if (message.ack === 1)
      return <Done fontSize="small" className={classes.ackIcons} />;
    if (message.ack === 2)
      return <DoneAll fontSize="small" className={classes.ackIcons} />;
    if (message.ack === 3)
      return <DoneAll fontSize="small" className={classes.ackDoneAllIcon} />;
    if (message.ack === 4)
      return <DoneAll fontSize="small" className={classes.ackDoneReadIcon} />;
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <span className={classes.dailyTimestamp} key={`timestamp-${message.id}`}>
          <div className={classes.dailyTimestampText}>
            {format(parseISO(messagesList[index]?.createdAt), "dd/MM/yyyy")}
          </div>
        </span>
      );
    }
    if (index < messagesList.length - 1) {
      const messageDay = parseISO(messagesList[index]?.createdAt);
      const previousMessageDay = parseISO(messagesList[index - 1]?.createdAt);
      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span
            className={classes.dailyTimestamp}
            key={`timestamp-${message.id}`}
          >
            <div className={classes.dailyTimestampText}>
              {format(parseISO(messagesList[index]?.createdAt), "dd/MM/yyyy")}
            </div>
          </span>
        );
      }
    }
    if (index === messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }
  };

  const renderTicketsSeparator = (message, index) => {
    if (index > 0) {
      const lastTicket = messagesList[index - 1]?.ticketId;
      const currentTicket = message?.ticketId;
      if (lastTicket !== currentTicket && lastTicket !== undefined) {
        if (message?.ticket?.queue) {
          return (
            <span
              className={classes.currentTick}
              key={`timestamp-${message.id}a`}
            >
              <div
                className={classes.currentTicktText}
                style={{
                  backgroundColor:
                    message?.ticket?.queue?.color || "grey",
                }}
              >
                #{i18n.t("ticketsList.called")} {message.ticketId} -{" "}
                {message.ticket?.queue?.name}
              </div>
            </span>
          );
        } else {
          return (
            <span
              className={classes.currentTick}
              key={`timestamp-${message.id}b`}
            >
              <div
                className={classes.currentTicktText}
                style={{ backgroundColor: "grey" }}
              >
                #{i18n.t("ticketsList.called")} {message.ticketId} -{" "}
                {i18n.t("ticketsList.noQueue")}
              </div>
            </span>
          );
        }
      }
    }
  };

  const renderMessageDivider = (message, index) => {
    if (index > 0 && index < messagesList.length) {
      const messageUser = messagesList[index]?.fromMe;
      const previousMessageUser = messagesList[index - 1]?.fromMe;
      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const renderQuotedMessage = (message) => {
    return (
      <div
        className={clsx(classes.quotedContainerLeft, {
          [classes.quotedContainerRight]: message.fromMe,
        })}
      >
        <span
          className={clsx(classes.quotedSideColorLeft, {
            [classes.quotedSideColorRight]: message.quotedMsg?.fromMe,
          })}
        ></span>
        <div className={classes.quotedMsg}>
          {!message.quotedMsg?.fromMe && (
            <span className={classes.messageContactName}>
              {message.quotedMsg?.contact?.name}
            </span>
          )}
          {message.quotedMsg?.mediaType === "audio" && (
            <div className={classes.downloadMedia}>
              <audio controls>
                <source
                  src={message.quotedMsg?.mediaUrl}
                  type="audio/ogg"
                />
              </audio>
            </div>
          )}
          {message.quotedMsg?.mediaType === "video" && (
            <video
              className={classes.messageMedia}
              src={message.quotedMsg?.mediaUrl}
              controls
            />
          )}
          {message.quotedMsg?.mediaType === "application" && (
            <div className={classes.downloadMedia}>
              <Button
                startIcon={<GetApp />}
                color="primary"
                variant="outlined"
                target="_blank"
                href={message.quotedMsg?.mediaUrl}
              >
                Download
              </Button>
            </div>
          )}
          {message.quotedMsg?.mediaType === "image" && (
            <ModalImageCors imageUrl={message.quotedMsg?.mediaUrl} />
          )}
          {/* Se não for imagem/áudio/vídeo/aplicação, mostra texto */}
          {message.quotedMsg?.mediaType !== "image" &&
            message.quotedMsg?.body}
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    return messagesList.map((message, index) => {
      // Lida com log de chamadas
      if (message.mediaType === "call_log") {
        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index)}
            {renderTicketsSeparator(message, index)}
            {renderMessageDivider(message, index)}
            <div className={classes.messageCenter}>
              <IconButton
                size="small"
                id="messageActionsButton"
                disabled={message.isDeleted}
                className={classes.messageActionsButton}
                onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
              >
                <ExpandMore />
              </IconButton>
              {isGroup && (
                <span className={classes.messageContactName}>
                  {message.contact?.name}
                </span>
              )}
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 17"
                  width="20"
                  height="17"
                >
                  <path
                    fill="#df3333"
                    d="M18.2 12.1c-1.5-1.8-5-2.7-8.2-2.7s-6.7 1-8.2 2.7c-.7.8-.3 2.3.2 2.8.2.2.3.3.5.3 1.4 0 3.6-.7 3.6-.7.5-.2.8-.5.8-1v-1.3c.7-1.2 5.4-1.2 6.4-.1l.1.1v1.3c0 .2.1.4.2.6.1.2.3.3.5.4"
                  ></path>
                </svg>
                <span>
                  Chamada de voz/vídeo perdida às{" "}
                  {format(parseISO(message.createdAt), "HH:mm")}
                </span>
              </div>
            </div>
          </React.Fragment>
        );
      }

      // Mensagens recebidas (lado esquerdo)
      if (!message.fromMe) {
        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index)}
            {renderTicketsSeparator(message, index)}
            {renderMessageDivider(message, index)}
            <div className={classes.messageLeft}>
              {showSelectMessageCheckbox && (
                <SelectMessageCheckbox
                  showSelectMessageCheckbox={showSelectMessageCheckbox}
                  message={message}
                />
              )}
              <IconButton
                size="small"
                id="messageActionsButton"
                disabled={message.isDeleted}
                className={classes.messageActionsButton}
                onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
              >
                <ExpandMore />
              </IconButton>
              {isGroup && (
                <span className={classes.messageContactName}>
                  {message.contact?.name}
                </span>
              )}
              {message.isDeleted && (
                <div>
                  <span className={classes.deletedMessage}>
                    🚫 {i18n.t("message.deleted")} &nbsp;
                  </span>
                </div>
              )}
              {(message.mediaUrl ||
                message.mediaType === "locationMessage" ||
                message.mediaType === "vcard" ||
                message.mediaType === "contactMessage") &&
                checkMessageMedia(message)}
              <div
                className={clsx(classes.textContentItem, {
                  [classes.textContentItemEdited]: message.isEdited,
                })}
              >
                {message.quotedMsg && renderQuotedMessage(message)}
                {message.mediaType !== "reactionMessage" && (
                  <MarkdownWrapper>
                    {message.mediaType === "locationMessage" ||
                    message.mediaType === "contactMessage" ||
                    message.mediaType === "vcard"
                      ? null
                      : message.body}
                  </MarkdownWrapper>
                )}
                {message.quotedMsg && message.mediaType === "reactionMessage" && (
                  <>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <span
                          style={{
                            fontSize: "4em",
                            marginTop: "-95px",
                            marginLeft: "340px",
                          }}
                        >
                          {message.body}
                        </span>
                      }
                    />
                    <span style={{ marginLeft: "0px" }}>
                      <MarkdownWrapper>
                        {"_*" + (message.contact?.name || "") + "*_ reagiu..."}
                      </MarkdownWrapper>
                    </span>
                  </>
                )}
                <span className={classes.timestamp}>
                  {message.isEdited && <span>{i18n.t("message.edited")} </span>}
                  {format(parseISO(message.createdAt), "HH:mm")}
                </span>
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        // Mensagens enviadas (lado direito)
        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index)}
            {renderTicketsSeparator(message, index)}
            {renderMessageDivider(message, index)}
            <div
              className={
                message.isPrivate
                  ? classes.messageRightPrivate
                  : classes.messageRight
              }
              title={message.queueId && message.queue?.name}
              onDoubleClick={(e) => handleReplyMessage(e, message)}
            >
              {showSelectMessageCheckbox && (
                <SelectMessageCheckbox
                  showSelectMessageCheckbox={showSelectMessageCheckbox}
                  message={message}
                />
              )}
              <IconButton
                size="small"
                id="messageActionsButton"
                disabled={message.isDeleted}
                className={classes.messageActionsButton}
                onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
              >
                <ExpandMore />
              </IconButton>
              {(message.mediaUrl ||
                message.mediaType === "locationMessage" ||
                message.mediaType === "vcard" ||
                message.mediaType === "contactMessage") &&
                checkMessageMedia(message)}
              <div
                className={clsx(classes.textContentItem, {
                  [classes.textContentItemDeleted]: message.isDeleted,
                  [classes.textContentItemEdited]: message.isEdited,
                })}
              >
                {message.isDeleted && (
                  <Block
                    color="disabled"
                    fontSize="small"
                    className={classes.deletedIcon}
                  />
                )}
                {message.quotedMsg && renderQuotedMessage(message)}
                {message.mediaType !== "reactionMessage" &&
                  message.mediaType !== "locationMessage" && (
                    <MarkdownWrapper>{message.body}</MarkdownWrapper>
                  )}
                {message.quotedMsg && message.mediaType === "reactionMessage" && (
                  <>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <span
                          style={{
                            fontSize: "4em",
                            marginTop: "-95px",
                            marginLeft: "340px",
                          }}
                        >
                          {message.body}
                        </span>
                      }
                    />
                    <span style={{ marginLeft: "0px" }}>
                      <MarkdownWrapper>
                        {"_*" + (message.contact?.name || "") + "*_ reagiu..."}
                      </MarkdownWrapper>
                    </span>
                  </>
                )}
                <span className={classes.timestamp}>
                  {message.isEdited && <span>{i18n.t("message.edited")} </span>}
                  {format(parseISO(message.createdAt), "HH:mm")}
                  {renderMessageAck(message)}
                </span>
              </div>
            </div>
          </React.Fragment>
        );
      }
    });
  };

  return (
    <div className={classes.messagesListWrapper}>
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={Boolean(anchorEl)}
        handleClose={handleCloseMessageOptionsMenu}
        showSelectCheckBox={showSelectMessageCheckbox}
        setShowSelectCheckbox={setShowSelectMessageCheckbox}
        forwardMessageModalOpen={forwardMessageModalOpen}
        setForwardMessageModalOpen={setForwardMessageModalOpen}
        selectedMessages={selectedMessagesList}
      />
      <div
        id="messagesList"
        className={classes.messagesList}
        onScroll={handleScroll}
      >
        {messagesList.length > 0 ? renderMessages() : []}
        {contactPresence === "composing" && (
          <div className={classes.messageLeft}>
            <div className={classes.wave}>
              <span className={classes.dot}></span>
              <span className={classes.dot}></span>
              <span className={classes.dot}></span>
            </div>
          </div>
        )}
        {contactPresence === "recording" && (
          <div className={classes.messageLeft}>
            <div className={classes.wavebarsContainer}>
              <div className={clsx(classes.wavebars, classes.wavebar1)}></div>
              <div className={clsx(classes.wavebars, classes.wavebar2)}></div>
              <div className={clsx(classes.wavebars, classes.wavebar3)}></div>
              <div className={clsx(classes.wavebars, classes.wavebar4)}></div>
              <div className={clsx(classes.wavebars, classes.wavebar5)}></div>
            </div>
          </div>
        )}
      </div>
      {loading && (
        <div>
          <CircularProgress className={classes.circleLoading} />
        </div>
      )}
    </div>
  );
};

export default MessagesList;
