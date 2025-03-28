import React, { useState, useEffect, useRef, useContext } from "react";

import { useHistory, useParams } from "react-router-dom";
import { differenceInMinutes, differenceInHours, parseISO, format, isSameDay, isYesterday } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { green, grey, red, blue } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";
import GroupIcon from '@material-ui/icons/Group';
import ConnectionIcon from "../ConnectionIcon";
import PhonelinkRingOutlinedIcon from '@mui/icons-material/PhonelinkRingOutlined';
import { i18n } from "../../translate/i18n";
import EdgesensorHighIcon from '@mui/icons-material/EdgesensorHigh';
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import MarkdownWrapper from "../MarkdownWrapper";
import { Tooltip } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import toastError from "../../errors/toastError";
import { v4 as uuidv4 } from "uuid";
import TapAndPlayIcon from '@mui/icons-material/TapAndPlay';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RoomIcon from '@material-ui/icons/Room';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import AndroidIcon from "@material-ui/icons/Android";
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import VisibilityIcon from "@material-ui/icons/Visibility";
import TicketMessagesDialog from "../TicketMessagesDialog";
import DoneIcon from '@material-ui/icons/Done';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import contrastColor from "../../helpers/contrastColor";
import CheckIcon from '@material-ui/icons/Check';
import ContactTag from "../ContactTag";
import "./styles.css";

const useStyles = makeStyles((theme) => ({
    ticket: {
      position: "relative",
      height: 90,
      paddingHorizontal: 10,
      paddingVertical: 0,
      borderRadius: "0px",
      backgroundColor: theme.palette.type === "dark" ? "transparent" : "#fff", // Modo noturno
      boxShadow: theme.palette.type === "dark" ? "3px 3px 5px rgba(51, 51, 51, 0.1)" : "0px 2px 5px rgba(0, 0, 0, 0.1)", // Modo noturno
      transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out", // Ajuste aqui para uma transição mais suave
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: theme.palette.type === "dark" ? "0px 4px 10px rgba(255, 255, 255, 0.0)" : "0px 4px 10px rgba(0, 0, 0, 0.0)", // Modo noturno
        backgroundColor: theme.palette.type === "dark" ? "#333" : "#F4F4F4", // Cor de fundo hover no modo escuro
      },
      marginBottom: "5px",
    },

  selected: {
    backgroundColor: "#EAEAEA", // Cor de fundo quando selecionado
  },
  pendingTicket: {
    cursor: "unset",
  },

  queueTag: {
    backgroundColor: theme.palette.primary.main, // Cor de fundo da etiqueta
    color: "#fff", // Cor do texto da etiqueta
    padding: "3px 8px", // Espaçamento interno da etiqueta
    borderRadius: "4px", // Raio da borda da etiqueta
    fontWeight: "bold", // Peso da fonte da etiqueta
    fontSize: "0.8rem", // Tamanho da fonte da etiqueta
    marginLeft: "5px", // Espaçamento à esquerda da etiqueta
    verticalAlign: "middle", // Alinhamento vertical da etiqueta
  },

  connectionIcon: {
    position: "absolute",
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
    top: "10px",
    left: "20px",
  },
  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  newMessagesCount: {
    position: "absolute",
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
    top: "20px",
    left: "50px",
    borderRadius: 0,
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  connectionTag: {
    background: "green",
    color: "#FFF",
    marginRight: 4,
    marginLeft: "-4px",
    padding: 4,
    top: "75px",
    position: "absolute",
    left: "15px",
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 7,
    fontSize: "0.5em",
    whiteSpace: "nowrap"
  },

  connectionIcon: {
    position: "absolute",
    alignSelf: "center",
    marginRight: 8,
    marginLeft: "auto",
    top: "10px",
    left: "20px",
  },
  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: "5px",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    fontWeight: 'bold',
    position: "relative",
    top: -21,
    color: "#008000", // Cor das datas
    border: "0px solid #3a3b6c",
    padding: 3,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 3,
    fontSize: 11,
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 32,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: "15%",
    marginLeft: "5px",
    marginRight: 32,
    paddingLeft: 2,
    padding: -1, // Altura do titulo Usuario das mensagens
  },
  secondaryContentSecond: {
    display: 'flex',
    marginTop: -1,
    marginLeft: "5px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    flexDirection: "row",
    alignContent: "flex-start",
  },


  badgeStyle: {
    color: "white",
    background: "#1EAA62", // Cor de conntagem de tickets
    // marginTop: -1,
    // top: -23,
    right: 20
  },

  acceptButton: {
    position: "absolute",
    right: "108px",
  },

  acceptButton: {
    position: "absolute",
    left: "75%",
  },
  
  ticketQueueColor: {
  position: "absolute",
  top: 0,
  left: "calc(100% - 8px)", // Isso posicionará o elemento 8px à esquerda do contêiner pai
  width: "8px",
  height: "100%",
  flex: "none",
},

  ticketInfo: {
    position: "relative",
    top: -13
  },

  redText: {
    color: "#A8A7B9", // Cor de horas das mensagens 
    marginLeft: 100,
    padding: 2,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    fontSize: "0.8em",
    whiteSpace: "nowrap",

    secondaryContentSecond: {
      display: 'flex',
      marginTop: 5,
      marginLeft: "5px",
      alignItems: "flex-start",
      flexWrap: "wrap",
      flexDirection: "row",
      alignContent: "flex-start",
    },

    ticketInfo1: {
      position: "relative",
      top: 20,
      right: 0
    },

    Radiusdot: {
      "& .MuiBadge-badge": {
        borderRadius: 3,
        position: "inherit",
        height: 16,
        margin: 2,
        padding: 3
      },
      "& .MuiBadge-anchorOriginTopRightRectangle": {
        transform: "scale(1) translate(0%, -40%)",
      },
    },
  }
}));


const TicketListItemCustom = ({ handleChangeTab, ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [selected, setSelected] = useState(false); // Estado para controlar a seleção
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [ticketQueueName, setTicketQueueName] = useState(null);
  const [ticketQueueColor, setTicketQueueColor] = useState(null);
  const [tag, setTag] = useState([]);
  const [whatsAppName, setWhatsAppName] = useState(null);

  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { profile } = user;
  // Calculando o tamanho do ícone do WhatsApp com base no tamanho do nome do contato
  const contactNameLength = ticket.contact.name.length;
  const iconSize = contactNameLength * 2;
  const { removeTicket, updateTicketStatus, openTicketMessagesDialog } = useContext(TicketsContext);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  
  const { id, messages, contact } = ticket;
  const [isSelected, setIsSelected] = useState(false);
  const { selectedTicketId, setSelectedTicketId } = useContext(TicketsContext);
  
  // Função para verificar se o ticket tem mensagens não lidas
  const calculateNewMessagesCount = () => {
    if (!messages || messages.length === 0) return 0;

    const lastReadMessageIndex = messages.findIndex((msg) => msg.read || msg.sentBy === user.id);
    const newMessages = messages.slice(lastReadMessageIndex + 1);
    return newMessages.length;
  };

  
  useEffect(() => {
    const count = calculateNewMessagesCount();
    setNewMessagesCount(count);
  }, [ticket]);

  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user?.name?.toUpperCase());
    }
    setTicketQueueName(ticket.queue?.name?.toUpperCase());
    setTicketQueueColor(ticket.queue?.color);

    if (ticket.whatsappId && ticket.whatsapp) {
      setWhatsAppName(ticket.whatsapp.name?.toUpperCase());
    }

    setTag(ticket?.tags);

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  {/*CÓDIGO NOVO SAUDAÇÃO*/ }
  const handleCloseTicket = async (id) => {
    setTag(ticket?.tags);
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "closed",
        userId: user?.id,
        queueId: ticket?.queue?.id,
        useIntegration: false,
        promptId: null,
        integrationId: null
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  const handleReopenTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: ticket?.queue?.id
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });

      let settingIndex;

      try {
        const { data } = await api.get("/settings/");
        settingIndex = data.filter((s) => s.key === "sendGreetingAccepted");
      } catch (err) {
        toastError(err);
      }

      if (settingIndex[0].value === "enabled" && !ticket.isGroup) {
        handleSendMessage(ticket.id);
      }

    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }

    // handleChangeTab(null, "tickets");
    // handleChangeTab(null, "open");
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleSendMessage = async (id) => {
    const msg = `{{ms}} *{{name}}*, meu nome é *${user?.name}* e agora vou prosseguir com seu atendimento!`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: `*Mensagem Automática:*\n${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toastError(err);
    }
  };
  {/*CÓDIGO NOVO SAUDAÇÃO*/ }

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const renderTicketInfo = () => {
    if (ticketUser) {
      const updatedAt = parseISO(ticket.updatedAt); // Supondo que ticket.updatedAt seja o timestamp da última atualização
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);

      const timeDifferenceMinutes = differenceInMinutes(today, updatedAt);
      const timeDifferenceHours = differenceInHours(today, updatedAt);

      const formattedTime = `${updatedAt.getHours().toString().padStart(2, '0')}:${updatedAt.getMinutes().toString().padStart(2, '0')}`;

      return (
        <>
          {ticket.lastMessage && (
            <div>
              <Badge className={`${classes.lastBadge} ${classes.leftAligned}`} title={i18n.t("Último Contato")}>
                <span className={classes.redText}>
                  {timeDifferenceMinutes < 48 * 60 ? (
                    timeDifferenceMinutes < 24 * 60 ? (
                      // Se a última atualização foi ontem ou antes disso e a diferença de tempo for inferior a 24 horas, exiba "Ontem" com data e hora
                      isYesterday(updatedAt) || updatedAt < yesterday ? (
                        `Ontem às ${formattedTime}`
                      ) : (
                        // Se a última atualização foi hoje e a diferença de tempo for inferior a 24 horas, exiba o tempo em horas ou minutos
                        `Há ${timeDifferenceHours > 0 ? timeDifferenceHours + ' horas' : timeDifferenceMinutes + ' minutos'}`
                      )
                    ) : (
                      // Se a última atualização foi ontem ou antes disso e a diferença de tempo for inferior a 48 horas, exiba "Ontem" com data e hora
                      isYesterday(updatedAt) || updatedAt < twoDaysAgo ? (
                        `Ontem às ${formattedTime}`
                      ) : (
                        // Se a última atualização foi hoje e a diferença de tempo for inferior a 48 horas, exiba a diferença de tempo em horas ou minutos
                        `Há ${timeDifferenceHours > 0 ? timeDifferenceHours + ' horas' : timeDifferenceMinutes + ' minutos'}`
                      )
                    )
                  ) : (
                    // Se a diferença de tempo for maior ou igual a 48 horas, não exiba nada
                    ""
                  )}
                </span>
              </Badge>
            </div>
          )}
          {ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{
                  padding: 2,
                  height: 21,
                  width: 21,
                  fontSize: 12,
                  color: '#fff',
                  cursor: "pointer",
                  backgroundColor: '#757575',
                  borderRadius: 50,
                  position: 'absolute',
                  right: 40,
                  top: -23
                }}
              />
            </Tooltip>
          )}

          {/* </span> */}
        </>
      );
    } else {
      return (
        <>
          {ticket.lastMessage && (
            <div>
              <Badge className={`${classes.lastBadge} ${classes.leftAligned}`} title={i18n.t("Último Contato")}>
                <span className={classes.redText}>
                  {isYesterday(parseISO(ticket.updatedAt)) || differenceInHours(new Date(), parseISO(ticket.updatedAt)) >= 24 ? (
                    "Ontem"
                  ) : (
                    `Há ${differenceInMinutes(new Date(), parseISO(ticket.updatedAt)) >= 60
                      ? differenceInHours(new Date(), parseISO(ticket.updatedAt))
                      : differenceInMinutes(new Date(), parseISO(ticket.updatedAt))
                    } ${differenceInMinutes(new Date(), parseISO(ticket.updatedAt)) >= 60
                      ? "horas"
                      : "minutos"
                    }`
                  )}
                </span>
              </Badge>
            </div>
          )}
          {ticket.chatbot && (
            <Tooltip title="Chatbot">
              <AndroidIcon
                fontSize="small"
                style={{
                  padding: 2,
                  height: 21,
                  width: 21,
                  fontSize: 12,
                  color: '#fff',
                  cursor: "pointer",
                  backgroundColor: '#757575',
                  borderRadius: 50,
                  position: 'absolute',
                  right: 40,
                  top: -23
                }}
              />
            </Tooltip>
          )}
        </>
      );
    }
  };


  return (
    <React.Fragment key={ticket.id}>
      <TicketMessagesDialog
        open={openTicketMessageDialog}

        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      ></TicketMessagesDialog>
      <ListItem dense button
        onClick={(e) => {
          if (ticket.status === "pending") return;
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === "pending",
        })}
      >
        <Tooltip arrow placement="right" title={ticket.queue?.name?.toUpperCase() || "SEM FILA"} >
          <span style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }} className={classes.ticketQueueColor}></span>
        </Tooltip>

        <ListItemAvatar>
  {ticket.status !== "pending" ? (
    <Avatar
      style={{
        backgroundColor: generateColor(ticket?.contact?.number),
        color: "white",
        fontWeight: "bold",
        marginTop: "8px",
        marginLeft: "-3px",
        width: "55px",
        height: "55px",
        borderRadius: "100%",
      }}
      src={ticket?.contact?.profilePicUrl}
    >
      {getInitials(ticket?.contact?.name || "")}
    </Avatar>
  ) : (
    <Avatar
      style={{
        marginTop: "8px",
        marginLeft: "-3px",
        width: "55px",
        height: "55px",
        borderRadius: "100%",
      }}
      src={ticket?.contact?.profilePicUrl}
    />
  )}
</ListItemAvatar>
        <ListItemText
          disableTypography

          primary={
            <span className={classes.contactNameWrapper}>
              <Typography
                noWrap
                component="span"
                variant="body2"
                color="textPrimary"
                style={{ display: 'flex', alignItems: 'center' }} // Adicione um estilo inline para alinhar verticalmente os elementos
              >
                {ticket.isGroup && ticket.channel === "whatsapp" && <GroupIcon fontSize="small" style={{ color: grey[700], marginBottom: '-5px', marginLeft: '5px' }} />} &nbsp;
                {ticket.channel && <ConnectionIcon width="30" height="30" className={classes.connectionIcon} connectionType={ticket.channel} />}
                {whatsAppName && ( // Verifica se whatsAppName está definido para mostrar o Tooltip
                  <Tooltip title={`${whatsAppName}`}>
                    <span>
                      <WhatsAppIcon
                        fontSize="small"
                        style={{ color: '#34E23C', marginRight: '4px', width: `${iconSize}px 5`, height: `${iconSize}px 5` }}
                      /> {/* Adiciona o ícone do WhatsApp */}
                    </span>
                  </Tooltip>
                )}
                {!whatsAppName && ( // Caso whatsAppName não esteja definido, mostra apenas o ícone do WhatsApp
                  <span>
                    <WhatsAppIcon fontSize="small" style={{ color: '#34E23C', marginRight: '5px' }} />
                  </span>
                )}
                {ticket.contact.name}
                {profile === "admin" && ticket.status === "" && (
                  <Tooltip title={`${whatsAppName}`}>
                    <TapAndPlayIcon
                      fontSize="small"
                      style={{
                        //backgroundColor: '#34E23C',
                        color: '#34E23C',
                        borderRadius: 50,
                        cursor: "pointer",
                        position: "absolute",
                        alignSelf: "center",
                        marginRight: 8,
                        marginLeft: "auto",
                        top: "75px",
                        left: "60px",
                      }}
                    />

                  </Tooltip>
                )}{' '}
                {/*{whatsAppName ? <Badge className={classes.connectionTag}>{whatsAppName}</Badge> : <br></br>}
                {/*{profile === "admin" && ticket.status === "pending" && (*/}
                {profile === "admin" && (
                  <Tooltip title="Espiar Conversa">
                    <VisibilityIcon
                      onClick={() => setOpenTicketMessageDialog(true)}
                      fontSize="small"
                      style={{
                        padding: 2,
                        height: 25,
                        width: 25,
                        fontSize: 12,
                        color: '#757575',
                        cursor: "pointer",
                        
                        borderRadius: 50,
                        position: 'absolute',
                        right: 20,
                        top: 60
                      }}
                    />
                  </Tooltip>
                )}


              </Typography>
              <ListItemSecondaryAction>
                <Box className={classes.ticketInfo1}>{renderTicketInfo()}</Box>
              </ListItemSecondaryAction>
            </span>
          }
          
          secondary={
            <span className={classes.contactNameWrapper}>

              <Typography
                className={classes.contactLastMessage}
                noWrap
                component="span"
                variant="body2"
                color="textSecondary"
              // style={console.log('ticket.lastMessage', ticket.lastMessage)}
              >
                <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                {/*{ticket.lastMessage ? (
                                    <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                                ) : (
                                    <br />
                                )}*/}
                <span className={classes.secondaryContentSecond} >
                  {/*{whatsAppName ? <Badge className={classes.connectionTag}>{whatsAppName}</Badge> : <br></br>}*/}
                  {/* {ticketUser ? <Badge style={{ backgroundColor: "#7C7C7C" }} className={classes.connectionTag}>{ticketUser}</Badge> : <br></br>}*/}
                 {/*<Badge style={{ backgroundColor: ticket.queue?.color || "#7c7c7c" }} className={classes.connectionTag}>{ticket.queue?.name.toUpperCase() || "Sem fila"}</Badge>*/}
                </span>
                <span style={{ paddingTop: "2px" }} className={classes.secondaryContentSecond} >
                  {tag?.map((tag) => {
                    return (
                      <ContactTag tag={tag} key={`ticket-contact-tag-${ticket.id}-${tag.id}`} />
                    );
                  })}
                </span>
              </Typography>
              <Badge
                className={classes.newMessagesCount}
                badgeContent={ticket.unreadMessages}
                classes={{
                  badge: classes.badgeStyle,
                }}
              />
            </span>
          }
        />
        <ListItemSecondaryAction>
          {ticket.lastMessage && (
            <>

              <Typography
                className={classes.lastMessageTime}
                component="span"
                variant="body2"
                color="textSecondary"
              >

                {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                  <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                ) : (
                  <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
                )}
              </Typography>
              <br />
            </>
          )}
        </ListItemSecondaryAction>
        <span className={classes.secondaryContentSecond} >
          {ticket.status === "pending" && (
            <Tooltip title="Aceitar">
  <CheckIcon
    onClick={() => handleAcepptTicket(ticket.id)}
    style={{
      padding: 2,
      height: 30, // Aumentando o tamanho do ícone
      width: 30, // Aumentando o tamanho do ícone
      color: '#34E23C',
      cursor: "pointer",
      position: 'absolute',
      right: 78,
      top: 57
    }}
  />
</Tooltip>
          )}
          {/*{(ticket.status !== "closed") && (
            <ButtonWithSpinner
              //color="primary"
              style={{ backgroundColor: '#4F35F9', color: 'white', padding: '1px', bottom: '4px', borderRadius: '10px', rigth: '7px', fontSize: '0.6rem', bottom: '5px' }}
              variant="contained"
              className={classes.acceptButton}
              size="small"
              loading={loading}
              onClick={e => handleCloseTicket(ticket.id)}
            >
              {i18n.t("ticketsList.buttons.closed")}
            </ButtonWithSpinner>

          )}*/}
          {ticket.status === "pending" && (
            <Tooltip title="Ignorar">
  <HighlightOffIcon
    onClick={() => handleCloseTicket(ticket.id)}
    style={{
      padding: 2,
      height: 30, // Aumentando o tamanho do ícone
      width: 30, // Aumentando o tamanho do ícone
      color: '#BA2B2B',
      cursor: "pointer",
      position: 'absolute',
      right: 48,
      top: 57
    }}
  />
</Tooltip>
          )}

        </span>
      </ListItem>
      {/* Conteúdo do ListItem */}
    </React.Fragment>
  );
};

export default TicketListItemCustom;