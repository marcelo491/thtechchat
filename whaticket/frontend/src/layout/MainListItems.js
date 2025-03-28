import React, {
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { isArray } from 'lodash';
import {
  Link as RouterLink,
  useHistory,
} from 'react-router-dom';
import {
  Badge,
  List,
  Collapse,
} from '@material-ui/core';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { Link } from 'react-router-dom';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import { Can } from '../components/Can';
import { AuthContext } from '../context/Auth/AuthContext';
import { WhatsAppsContext } from '../context/WhatsApp/WhatsAppsContext';
import toastError from '../errors/toastError';
import usePlans from '../hooks/usePlans';
import api from '../services/api';
import { socketConnection } from '../services/socket';
import { i18n } from '../translate/i18n';

import {
  HousePlus,
  PieChart,
  MessageCircle,
  KanbanSquare,
  Kanban,
  MessagesSquare,
  HelpCircle,
  ListChecks,
  Bot,
  Tags,
  Users,
  CalendarPlus,
  Zap,
  GitMerge,
  MonitorCog,
  Tag,
  Power,
  TrendingUp,
  Settings2,
  ListTodo,
  BookOpen,
  Workflow,
  SmartphoneNfc,
  FolderSymlink,
  UserPlus,
  Landmark,
  Settings,
  Flag  // Novo ícone para o cabeçalho de Campanhas
} from "lucide-react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  listItem: {
    borderRadius: '10px',
    marginBottom: '8px',
    padding: '8px 16px',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#333333' : '#212564',
    },
  },
  active: {
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : '#696CFF',
    borderLeft: `3px solid #ffffff`,
  },
  ListSubheader: {
    height: 25,
    marginTop: "-5px",
    marginBottom: "5px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "left",
    paddingLeft: 16,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  list: {
    padding: 0,
    margin: 0,
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, active, className } = props;
  const classes = useStyles();

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem
        button
        dense
        component={renderLink}
        className={`${classes.listItem} ${active ? classes.active : ''} ${className || ''}`}
      >
        {icon ? (
          <ListItemIcon style={{ color: "#ffffff" }}>
            {React.cloneElement(icon, { fontSize: 'small' })}
          </ListItemIcon>
        ) : null}
        <ListItemText
          primary={primary}
          style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500" }}
        />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }
    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);
    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props) => {
  const classes = useStyles();
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  // Estados para os submenus
  const [openCampaignsSubmenu, setOpenCampaignsSubmenu] = useState(false);
  const [openAdminSubmenu, setOpenAdminSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const history = useHistory();
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [showTypeBotInMainMenu, setShowTypeBotInMainMenu] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();

  // Versão atualizada conforme solicitado
  const versionStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    fontSize: "11px",
    color: "#ffffff",
    padding: "10px",
    fontWeight: "bold",
    marginTop: "5px"
  };

  const badgeStyle = {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#4caf50",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "2px 8px",
    marginLeft: "8px",
    fontSize: "10px",
  };

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const showTypeBotInMainMenu = data.find((d) => d.key === "showTypeBotInMainMenu");
        if (showTypeBotInMainMenu) {
          setShowTypeBotInMainMenu(showTypeBotInMainMenu.value);
        }
      }
    });
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
  }, [user.companyId, getPlanCompany]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    setInvisible(unreadsCount === 0);
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        setConnectionWarning(offlineWhats.length > 0);
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleClickLogout = () => {
    handleLogout();
  };

  const handleAdminClick = (e) => {
    e.stopPropagation();
    setOpenAdminSubmenu(!openAdminSubmenu);
  };

  const handleCampaignsClick = (e) => {
    e.stopPropagation();
    setOpenCampaignsSubmenu(!openCampaignsSubmenu);
  };

  return (
    <div onClick={drawerClose}>
      {/* SEÇÃO DO ATENDIMENTO */}
      <Can
        role={user.profile}
        perform={"drawer-service-items:view"}
        style={{ overflowY: "scroll" }}
        no={() => (
          <>
            <Can
              role={user.profile}
              perform={"dashboard:view"}
              yes={() => (
                <ListItem
                  button
                  component={RouterLink}
                  to="/"
                  className={`${classes.listItem} ${history.location.pathname === "/" ? classes.active : ''}`}
                >
                  <ListItemIcon style={{ color: '#ffffff' }}>
                    <HousePlus fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={i18n.t("mainDrawer.listItems.dashboard")}
                    style={{ fontSize: "14px", fontWeight: "500" }}
                  />
                </ListItem>
              )}
            />

            <ListItemLink
              to="/tickets"
              primary={i18n.t("mainDrawer.listItems.tickets")}
              icon={<MessageCircle fontSize="small" />}
              active={history.location.pathname === "/tickets"}
            />
            <ListItemLink
              to="/relatorios"
              primary={i18n.t("Relátorios")}
              icon={<PieChart fontSize="small" />}
              active={history.location.pathname === "/relatorios"}
            />
            <ListItemLink
              to="/quick-messages"
              primary={i18n.t("mainDrawer.listItems.quickMessages")}
              icon={<Zap fontSize="small" />}
              active={history.location.pathname === "/quick-messages"}
            />
            {showKanban && (
              <ListItemLink
                to="/kanban"
                primary={i18n.t("mainDrawer.listItems.kanban")}
                icon={<KanbanSquare fontSize="small" />}
                active={history.location.pathname === "/kanban"}
              />
            )}
            <ListItemLink
              to="/todolist"
              primary={i18n.t("mainDrawer.listItems.todolist")}
              icon={<ListChecks fontSize="small" />}
              active={history.location.pathname === "/todolist"}
            />
            <ListItemLink
              to="/contacts"
              primary={i18n.t("mainDrawer.listItems.contacts")}
              icon={<Users fontSize="small" />}
              active={history.location.pathname === "/contacts"}
            />
            {showSchedules && (
              <ListItemLink
                to="/schedules"
                primary={i18n.t("mainDrawer.listItems.schedules")}
                icon={<CalendarPlus fontSize="small" />}
                active={history.location.pathname === "/schedules"}
              />
            )}
            <ListItemLink
              to="/tags"
              primary={i18n.t("mainDrawer.listItems.tags")}
              icon={<Tag fontSize="small" />}
              active={history.location.pathname === "/tags"}
            />
            {showInternalChat && (
              <ListItemLink
                to="/chats"
                primary={i18n.t("mainDrawer.listItems.chats")}
                icon={
                  <Badge color="secondary" variant="dot" invisible={invisible}>
                    <MessagesSquare fontSize="small" />
                  </Badge>
                }
                active={history.location.pathname === "/chats"}
              />
            )}
            {/* Menu de Typebot oculto */}

            <ListItemLink
              to="/helps"
              primary={i18n.t("mainDrawer.listItems.helps")}
              icon={<HelpCircle fontSize="small" />}
              active={history.location.pathname === "/helps"}
            />

            {/* Submenu de Campanhas fora de Administração */}
            {showCampaigns && (
              <>
                <ListItem
                  button
                  onClick={handleCampaignsClick}
                  className={classes.listItem}
                >
                  <ListItemIcon>
                    <Flag fontSize="small" style={{ color: "white" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={i18n.t("mainDrawer.listItems.campaigns")}
                    style={{ color: "white", fontSize: "14px", fontWeight: "500" }}
                  />
                  {openCampaignsSubmenu ? (
                    <ExpandLess style={{ color: "white" }} />
                  ) : (
                    <ExpandMore style={{ color: "white" }} />
                  )}
                </ListItem>
                <Collapse in={openCampaignsSubmenu} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemLink
                      to="/campaigns"
                      primary={i18n.t("mainDrawer.listItems.campaigns")}
                      icon={<TrendingUp fontSize="small" />} 
                      active={history.location.pathname === "/campaigns"}
                    />
                    <ListItemLink
                      to="/contact-lists"
                      primary={i18n.t("mainDrawer.listItems.lists")}
                      icon={<ListTodo fontSize="small" />}
                      active={history.location.pathname === "/contact-lists"}
                    />
                    <ListItemLink
                      to="/campaigns-config"
                      primary={i18n.t("mainDrawer.listItems.config")}
                      icon={<Settings2 fontSize="small" />}
                      active={history.location.pathname === "/campaigns-config"}
                    />
                  </List>
                </Collapse>
              </>
            )}
          </>
        )}
      />

      {/* Bloco de Administração */}
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <ListItem
              button
              onClick={handleAdminClick}
              className={classes.listItem}
            >
              <ListItemIcon>
                <MonitorCog fontSize="small" style={{ color: "white" }} />
              </ListItemIcon>
              <ListItemText
                primary={i18n.t("mainDrawer.listItems.administration")}
                style={{ color: "white", fontSize: "14px", fontWeight: "500" }}
              />
              {openAdminSubmenu ? (
                <ExpandLess style={{ color: "white" }} />
              ) : (
                <ExpandMore style={{ color: "white" }} />
              )}
            </ListItem>
            <Collapse in={openAdminSubmenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {user.super && (
                  <ListItemLink
                    to="/announcements"
                    primary={i18n.t("mainDrawer.listItems.annoucements")}
                    icon={<BookOpen fontSize="small" />}
                    active={history.location.pathname === "/announcements"}
                  />
                )}
                {showOpenAi && (
                  <ListItemLink
                    to="/prompts"
                    primary={i18n.t("mainDrawer.listItems.prompts")}
                    icon={<Bot fontSize="small" />}
                    active={history.location.pathname === "/prompts"}
                  />
                )}
                {showIntegrations && (
                  <ListItemLink
                    to="/queue-integration"
                    primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                    icon={<GitMerge fontSize="small" />}
                    active={history.location.pathname === "/queue-integration"}
                  />
                )}
                <ListItemLink
                  to="/connections"
                  primary={i18n.t("mainDrawer.listItems.connections")}
                  icon={
                    <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                      <SmartphoneNfc fontSize="small" />
                    </Badge>
                  }
                  active={history.location.pathname === "/connections"}
                />
                <ListItemLink
                  to="/files"
                  primary={i18n.t("mainDrawer.listItems.files")}
                  icon={<FolderSymlink fontSize="small" />}
                  active={history.location.pathname === "/files"}
                />
                <ListItemLink
                  to="/queues"
                  primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={<Workflow fontSize="small" />}
                  active={history.location.pathname === "/queues"}
                />
                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<UserPlus fontSize="small" />}
                  active={history.location.pathname === "/users"}
                />
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<Landmark fontSize="small" />}
                  active={history.location.pathname === "/financeiro"}
                />
                <ListItemLink
                  to="/settings"
                  primary={i18n.t("mainDrawer.listItems.settings")}
                  icon={<Settings fontSize="small" />}
                  active={history.location.pathname === "/settings"}
                />
              </List>
            </Collapse>
          </>
        )}
      />

      <li>
        <ListItem button dense onClick={handleClickLogout}>
          <ListItemIcon>
            <Power style={{ color: "#ffffff" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={i18n.t("Sair")}
            style={{ color: "#ffffff", fontSize: "14px", fontWeight: "500" }}
          />
        </ListItem>
        <Typography style={versionStyle}>
          V:2.1.7
        </Typography>
      </li>
    </div>
  );
};

export default MainListItems;
