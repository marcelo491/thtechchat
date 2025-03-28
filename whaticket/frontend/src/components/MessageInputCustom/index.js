import React, { useState, useEffect, useContext, useRef } from "react";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import MicRecorder from "mic-recorder-to-mp3";
import clsx from "clsx";
import { isNil, isEmpty, isString, isObject, has } from "lodash";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import { green } from "@material-ui/core/colors";
import IconButton from "@material-ui/core/IconButton";
import { FormControlLabel, Switch } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";

// Import dos ícones modernos da react-icons/bi
import {
  BiPaperclip,
  BiSmile,
  BiSend,
  BiXCircle,
  BiTrash,
  BiMicrophone,
  BiX
} from "react-icons/bi";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import axios from "axios";

import RecordingTimer from "./RecordingTimer";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import toastError from "../../errors/toastError";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";

import useQuickMessages from "../../hooks/useQuickMessages";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    background: theme.palette.tabHeaderBackground,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: 0,
      width: "100%",
    },
  },
  newMessageBox: {
    background: theme.palette.tabHeaderBackground,
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },
  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    background: theme.palette.total,
    display: "flex",
    borderRadius: 20,
    flex: 1,
    position: "relative",
    border: "none",
    minHeight: 40,
    maxHeight: 80,
  },
  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
    maxHeight: 80,
    overflowY: "auto",
  },
  sendMessageIcons: {
    color: "grey",
  },
  uploadInput: {
    display: "none",
  },
  viewMediaInputWrapper: {
    maxHeight: "80%",
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.palette.background.primary,
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },
  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },
  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },
  audioLoading: {
    color: green[500],
    opacity: "70%",
  },
  recorderWrapper: {
    display: "flex",
    alignItems: "center",
  },
  // Indicador de gravação com efeito "pulse"
  recordingIndicator: {
    width: 10,
    height: 10,
    backgroundColor: "red",
    borderRadius: "50%",
    marginRight: 8,
    animation: "$pulse 1s infinite",
  },
  "@keyframes pulse": {
    "0%": { transform: "scale(0.9)", opacity: 0.7 },
    "50%": { transform: "scale(1.1)", opacity: 1 },
    "100%": { transform: "scale(0.9)", opacity: 0.7 },
  },
  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 73,
    paddingRight: 7,
  },
  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },
  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },
  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },
  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },
  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },
  // Novo estilo para o botão de envio de áudio: botão redondo com border-radius de 5px e fundo primário, ícone branco
  sendAudioButton: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 5,
    padding: 8,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

// Botão de Emoji (mantém seu modelo)
const EmojiOptions = (props) => {
  const { disabled, showEmoji, setShowEmoji, handleAddEmoji } = props;
  const classes = useStyles();
  return (
    <>
      <IconButton
        aria-label="emojiPicker"
        component="span"
        disabled={disabled}
        onClick={() => setShowEmoji((prevState) => !prevState)}
      >
        <BiSmile className={classes.sendMessageIcons} />
      </IconButton>
      {showEmoji && (
        <div className={classes.emojiBox}>
          <Picker
            perLine={16}
            showPreview={false}
            showSkinTones={false}
            onSelect={handleAddEmoji}
          />
        </div>
      )}
    </>
  );
};

// Componente para assinatura (mantém seu modelo)
const SignSwitch = (props) => {
  const { width, setSignMessage, signMessage } = props;
  if (isWidthUp("md", width)) {
    return (
      <FormControlLabel
        style={{ marginRight: 7, color: "gray" }}
        label={i18n.t("messagesInput.signMessage")}
        labelPlacement="start"
        control={
          <Switch
            size="small"
            checked={signMessage}
            onChange={(e) => setSignMessage(e.target.checked)}
            name="showAllTickets"
            color="primary"
          />
        }
      />
    );
  }
  return null;
};

// Componente para upload de arquivos (mantém seu modelo)
const FileInput = (props) => {
  const { handleChangeMedias, disableOption } = props;
  const classes = useStyles();
  return (
    <>
      <input
        multiple
        type="file"
        id="upload-button"
        disabled={disableOption()}
        className={classes.uploadInput}
        onChange={handleChangeMedias}
      />
      <label htmlFor="upload-button">
        <IconButton
          aria-label="upload"
          component="span"
          disabled={disableOption()}
        >
          <BiPaperclip className={classes.sendMessageIcons} />
        </IconButton>
      </label>
    </>
  );
};

// Botões de ação: enviar mensagem ou controle de áudio
const ActionButtons = (props) => {
  const {
    inputMessage,
    loading,
    recording,
    ticketStatus,
    handleSendMessage,
    handleCancelAudio,
    handleUploadAudio,
    handleStartRecording,
  } = props;
  const classes = useStyles();
  if (inputMessage) {
    return (
      <IconButton
        aria-label="sendMessage"
        component="span"
        onClick={handleSendMessage}
        disabled={loading}
      >
        <BiSend className={classes.sendMessageIcons} />
      </IconButton>
    );
  } else if (recording) {
    return (
      <div className={classes.recorderWrapper}>
        <IconButton
          aria-label="cancelRecording"
          component="span"
          disabled={loading}
          onClick={handleCancelAudio}
        >
          <BiX className={classes.sendMessageIcons} />
        </IconButton>
        {/* Indicador de gravação com efeito */}
        <div className={classes.recordingIndicator} />
        {loading ? (
          <CircularProgress className={classes.audioLoading} size={24} />
        ) : (
          <RecordingTimer />
        )}
        {/* Botão de envio de áudio com fundo primário e ícone branco */}
        <IconButton
          aria-label="sendRecordedAudio"
          component="span"
          onClick={handleUploadAudio}
          disabled={loading}
          className={classes.sendAudioButton}
        >
          <BiSend style={{ color: "#fff" }} />
        </IconButton>
      </div>
    );
  } else {
    return (
      <IconButton
        aria-label="showRecorder"
        component="span"
        disabled={loading || ticketStatus !== "open"}
        onClick={handleStartRecording}
      >
        <BiMicrophone className={classes.sendMessageIcons} />
      </IconButton>
    );
  }
};

// Componente de input com Autocomplete para quick messages
const CustomInput = (props) => {
  const {
    loading,
    inputRef,
    ticketStatus,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleInputPaste,
    disableOption,
    handleQuickAnswersClick,
  } = props;
  const classes = useStyles();
  const [quickMessages, setQuickMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [popupOpen, setPopupOpen] = useState(false);

  const { user } = useContext(AuthContext);
  const { list: listQuickMessages } = useQuickMessages();

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const messages = await listQuickMessages({ companyId, userId: user.id });
      const options = messages.map((m) => {
        let truncatedMessage = m.message;
        if (isString(truncatedMessage) && truncatedMessage.length > 35) {
          truncatedMessage = m.message.substring(0, 35) + "...";
        }
        return {
          value: m.message,
          label: `/${m.shortcode} - ${truncatedMessage}`,
          mediaPath: m.mediaPath,
        };
      });
      setQuickMessages(options);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isString(inputMessage) && !isEmpty(inputMessage)) {
      const firstChar = inputMessage.charAt(0);
      setPopupOpen(firstChar === "/");
      const filteredOptions = quickMessages.filter((message) =>
        message.label.toUpperCase().includes(inputMessage.toUpperCase())
      );
      setOptions(filteredOptions);
    } else {
      setPopupOpen(false);
    }
  }, [inputMessage]);

  const onKeyPress = (e) => {
    if (loading) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onPaste = (e) => {
    if (ticketStatus === "open") {
      handleInputPaste(e);
    }
  };

  const renderPlaceholder = () => {
    return ticketStatus === "open"
      ? i18n.t("messagesInput.placeholderOpen")
      : i18n.t("messagesInput.placeholderClosed");
  };

  const setInputRefHandler = (input) => {
    if (input) {
      input.focus();
      inputRef.current = input;
    }
  };

  return (
    <div className={classes.messageInputWrapper}>
      <Autocomplete
        freeSolo
        disableClearable
        clearIcon={null}
        open={popupOpen}
        id="grouped-demo"
        value={inputMessage}
        options={options}
        getOptionLabel={(option) => (isObject(option) ? option.label : option)}
        onChange={(event, opt) => {
          if (isObject(opt) && has(opt, "value") && isNil(opt.mediaPath)) {
            setInputMessage(opt.value);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          } else if (isObject(opt) && has(opt, "value") && !isNil(opt.mediaPath)) {
            handleQuickAnswersClick(opt);
            setTimeout(() => {
              inputRef.current.scrollTop = inputRef.current.scrollHeight;
            }, 200);
          }
        }}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === "input") {
            setInputMessage(newInputValue);
          }
        }}
        onPaste={onPaste}
        onKeyPress={onKeyPress}
        style={{ width: "100%" }}
        renderInput={(params) => (
          <InputBase
            {...params.InputProps}
            {...params}
            disabled={disableOption()}
            inputRef={setInputRefHandler}
            placeholder={renderPlaceholder()}
            multiline
            className={classes.messageInput}
            maxRows={5}
            inputProps={{ ...params.inputProps, spellCheck: true }}
          />
        )}
      />
    </div>
  );
};

const MessageInputCustom = (props) => {
  const { ticketStatus, ticketId } = props;
  const classes = useStyles();

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false); // Mantém o estado para compatibilidade
  const inputRef = useRef();
  const [onDragEnter, setOnDragEnter] = useState(false);
  const { setReplyingMessage, replyingMessage } = useContext(ReplyMessageContext);
  const { setEditingMessage, editingMessage } = useContext(EditMessageContext);
  const { user } = useContext(AuthContext);

  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);

  useEffect(() => {
    inputRef.current.focus();
    if (editingMessage) {
      setInputMessage(editingMessage.body);
    }
  }, [replyingMessage, editingMessage]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
      setEditingMessage(null);
    };
  }, [ticketId, setReplyingMessage, setEditingMessage]);

  useEffect(() => {
    setTimeout(() => {
      setOnDragEnter(false);
    }, 10000);
  }, [onDragEnter === true]);

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) return;
    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      const selectedMedias = Array.from(e.clipboardData.files);
      setMedias(selectedMedias);
    }
  };

  const handleInputDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      const selectedMedias = Array.from(e.dataTransfer.files);
      setMedias(selectedMedias);
    }
  };

  const handleUploadQuickMessageMedia = async (blob, message) => {
    setLoading(true);
    try {
      const extension = blob.type.split("/")[1];
      const formData = new FormData();
      const filename = `${new Date().getTime()}.${extension}`;
      formData.append("medias", blob, filename);
      formData.append("body", message);
      formData.append("fromMe", true);
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleQuickAnswersClick = async (value) => {
    if (value.mediaPath) {
      try {
        const { data } = await axios.get(value.mediaPath, { responseType: "blob" });
        await handleUploadQuickMessageMedia(data, value.value);
        setInputMessage("");
        return;
      } catch (err) {
        toastError(err);
      }
    }
    setInputMessage(value.value);
  };

  const handleUploadMedia = async (e) => {
    setLoading(true);
    if (e) e.preventDefault();
    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });
    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: !editingMessage && signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      if (editingMessage !== null) {
        await api.post(`/messages/edit/${editingMessage.id}`, message);
      } else {
        await api.post(`/messages/${ticketId}`, message);
      }
    } catch (err) {
      toastError(err);
    }
    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
    setEditingMessage(null);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setPaused(false);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        return;
      }
      const formData = new FormData();
      const filename = `audio-record-site-${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }
    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  };

  const disableOption = () => {
    return loading || recording || ticketStatus !== "open";
  };

  const renderReplyingMessage = (message) => {
    return (
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          <div className={classes.replyginMsgBody}>
            {!message.fromMe && (
              <span className={classes.messageContactName}>
                {message.contact?.name}
              </span>
            )}
            {message.body}
          </div>
        </div>
        <IconButton
          aria-label="cancelReply"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => setReplyingMessage(null)}
        >
          <BiTrash className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };

  if (medias.length > 0)
    return (
      <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={() => setMedias([])}
        >
          <BiXCircle className={classes.sendMessageIcons} />
        </IconButton>
        {loading ? (
          <div>
            <CircularProgress className={classes.circleLoading} />
          </div>
        ) : (
          <span>{medias[0]?.name}</span>
        )}
        <IconButton
          aria-label="send-upload"
          component="span"
          onClick={handleUploadMedia}
          disabled={loading}
        >
          <BiSend className={classes.sendMessageIcons} />
        </IconButton>
      </Paper>
    );
  else {
    return (
      <Paper square elevation={0} className={classes.mainWrapper}>
        {replyingMessage && renderReplyingMessage(replyingMessage)}
        <div className={classes.newMessageBox}>
          <EmojiOptions
            disabled={disableOption()}
            handleAddEmoji={handleAddEmoji}
            showEmoji={showEmoji}
            setShowEmoji={setShowEmoji}
          />

          <FileInput
            disableOption={disableOption}
            handleChangeMedias={handleChangeMedias}
          />

          <SignSwitch
            width={props.width}
            setSignMessage={setSignMessage}
            signMessage={signMessage}
          />

          <CustomInput
            loading={loading}
            inputRef={inputRef}
            ticketStatus={ticketStatus}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            handleInputPaste={handleInputPaste}
            disableOption={disableOption}
            handleQuickAnswersClick={handleQuickAnswersClick}
          />

          <ActionButtons
            inputMessage={inputMessage}
            loading={loading}
            recording={recording}
            paused={paused}
            ticketStatus={ticketStatus}
            handleSendMessage={handleSendMessage}
            handleCancelAudio={handleCancelAudio}
            handleUploadAudio={handleUploadAudio}
            handleStartRecording={handleStartRecording}
          />
        </div>
      </Paper>
    );
  }
};

export default withWidth()(MessageInputCustom);
