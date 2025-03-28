import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Paper,
  InputBase,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  Switch,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Search as SearchIcon,
  Add as AddIcon,
  LibraryBooks as LibraryBooksIcon,
  LibraryAddCheck as LibraryAddCheckIcon,
  Group as GroupIcon,
} from "@material-ui/icons";
import toastError from '../../errors/toastError';
import api from '../../services/api';
import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsListCustom";
import TicketsListGroup from "../TicketsListGroup";
import TabPanel from "../TabPanel";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import TicketsQueueSelect from "../TicketsQueueSelect";
import { TagsFilter } from "../TagsFilter";
import { UsersFilter } from "../UsersFilter";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    background: theme.palette.type === 'dark' ? '#2c2c2c' : theme.palette.optionsBackground,
  },
  tabsHeader: {
    flex: "none",
    backgroundColor: theme.palette.type === 'dark' ? '#333333' : theme.palette.tabHeaderBackground,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  ticketOptionsBox: {
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(1),
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  tab: {
    backgroundColor: theme.palette.type === 'dark' ? '#333333' : theme.palette.tabHeaderBackground,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    minWidth: 70,
    fontSize: 12,
    marginLeft: "none",
  },
  tabPanelItem: {
    backgroundColor: theme.palette.type === 'dark' ? '#333333' : theme.palette.tabHeaderBackground,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    minWidth: 80,
    fontSize: 12,
    marginLeft: 0,
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(1),
    //borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : "#F5F5F5",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.3s ease, background-color 0.3s ease",
    "&:focus-within": {
      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.3)",
      backgroundColor: theme.palette.type === 'dark' ? '#3a3a3a' : "#f0f0f0",
    },
  },
  searchInput: {
    flex: 1,
    //border: "none",
    outline: "none",
    fontSize: "1rem",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.type === 'dark' ? '#3a3a3a' : "#F0F0F0",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: theme.palette.type === 'dark' ? '#4a4a4a' : "#f0f0f0",
    },
    "&::placeholder": {
      color: theme.palette.type === 'dark' ? '#b0b0b0' : "#888",
    },
  },
  searchIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: "1.2rem",
    color: theme.palette.type === 'dark' ? '#ffffff' : '#000000',
  },
  iconsContainer: {
    display: "flex",
    gap: theme.spacing(1),
  },
  iconButtonActive: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    position: "relative",
    "&:hover": {
      backgroundColor: theme.palette.primary.light, // Não muda a cor ao passar o mouse quando estiver ativo
    },
  },
  iconButtonInactive: {
    backgroundColor: theme.palette.type === 'dark' ? '#333333' : "#F5F5F5",
    color: theme.palette.grey[600],
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  queueContainer: {
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : "#ffffff",
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  ticketsQueueSelect: {
    minWidth: 300,
  },
  queueColorBox: {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: "50%",
    marginRight: theme.spacing(1),
  },
}));

const TicketsManagerTabs = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [searchParam, setSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [selectedQueueIds, setSelectedQueueIds] = useState(user.queues.map((q) => q.id) || []);
  const [showAllTickets, setShowAllTickets] = useState(user.profile.toUpperCase() === "ADMIN" || user.allUserChat === "enabled");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [tooltipOpen, setTooltipOpen] = useState(null);
  const searchInputRef = useRef();

const [setClosedBox, setClosed] = useState(false);
  const [setGroupBox, setGroup] = useState(false);

  useEffect(() => {
    async function fetchData() {
      let settingIndex;

      try {
        const { data } = await api.get('/settings/');
        settingIndex = data.filter((s) => s.key === 'viewclosed');
      } catch (err) {
        toastError(err);
      }

      if (settingIndex[0]?.value === 'enabled') {
        setClosed(true);
      } else {
        if (user.profile === 'admin') {
          setClosed(true);
        } else {
          setClosed(false);
        }
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      let settingIndex;

      try {
        const { data } = await api.get('/settings/');
        settingIndex = data.filter((s) => s.key === 'viewgroups');
      } catch (err) {
        toastError(err);
      }

      if (settingIndex[0]?.value === 'enabled') {
        setGroup(true);
      } else {
        if (user.profile === 'admin') {
          setGroup(true);
        } else {
          setGroup(false);
        }
      }
    }
    fetchData();
  }, []);
  useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
  }, [tab]);

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();
    setSearchParam(searchedTerm);
    setTab(searchedTerm === "" ? "open" : "search");
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleSelectedTags = (selecteds) => {
    const tags = selecteds.map((t) => t.id);
    setSelectedTags(tags);
  };

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  const handleQueueChange = (queueId) => {
    setSelectedQueueIds((prevQueueIds) => {
      if (prevQueueIds.includes(queueId)) {
        return prevQueueIds.filter((id) => id !== queueId);
      } else {
        return [...prevQueueIds, queueId];
      }
    });
  };

  const handleTooltipOpen = (tooltip) => {
    setTooltipOpen(tooltip);
  };

  const handleTooltipClose = () => {
    setTooltipOpen(null);
  };

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={() => setNewTicketModalOpen(false)}
      />
      <div className={classes.ticketOptionsBox}>
        <span className={classes.headerTitle}>Conversas</span>
        <div className={classes.iconsContainer}>
          <Tooltip
            title="Novo Ticket"
            arrow
            open={tooltipOpen === "newTicket"}
            onClose={handleTooltipClose}
          >
            <IconButton
              onClick={() => {
                setNewTicketModalOpen(true);
                handleTooltipOpen("newTicket");
              }}
              onMouseEnter={() => handleTooltipOpen("newTicket")}
              onMouseLeave={handleTooltipClose}
              className={classes.iconButtonInactive}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title="Entrada"
            arrow
            open={tooltipOpen === "entrada"}
            onClose={handleTooltipClose}
            classes={{ tooltip: tooltipOpen === "entrada" ? classes.iconButtonActive : undefined }}
          >
            <IconButton
              data-title="Entrada"
              onClick={() => {
                setTab("open");
                handleTooltipOpen("entrada");
              }}
              onMouseEnter={() => handleTooltipOpen("entrada")}
              onMouseLeave={handleTooltipClose}
              className={tab === "open" ? classes.iconButtonActive : classes.iconButtonInactive}
            >
              <LibraryBooksIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title="Finalizado"
            arrow
            open={tooltipOpen === "finalizado"}
            onClose={handleTooltipClose}
            classes={{ tooltip: tooltipOpen === "finalizado" ? classes.iconButtonActive : undefined }}
          >
            <IconButton
              data-title="Finalizado"
              onClick={() => {
                setTab("closed");
                handleTooltipOpen("finalizado");
              }}
              onMouseEnter={() => handleTooltipOpen("finalizado")}
              onMouseLeave={handleTooltipClose}
              className={tab === "closed" ? classes.iconButtonActive : classes.iconButtonInactive}
            >
              <LibraryAddCheckIcon />
            </IconButton>
          </Tooltip>
          {setGroupBox && (
            <Tooltip
              title="Grupos"
              arrow
              open={tooltipOpen === "grupos"}
              onClose={handleTooltipClose}
              classes={{ tooltip: tooltipOpen === "grupos" ? classes.iconButtonActive : undefined }}
            >
              <IconButton
                data-title="Grupos"
                onClick={() => {
                  setTab("group");
                  handleTooltipOpen("grupos");
                }}
                onMouseEnter={() => handleTooltipOpen("grupos")}
                onMouseLeave={handleTooltipClose}
                className={tab === "group" ? classes.iconButtonActive : classes.iconButtonInactive}
              >
                <GroupIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip
            title="Pesquisa"
            arrow
            open={tooltipOpen === "pesquisa"}
            onClose={handleTooltipClose}
            classes={{ tooltip: tooltipOpen === "pesquisa" ? classes.iconButtonActive : undefined }}
          >
            <IconButton
              data-title="Pesquisa"
              onClick={() => {
                setTab("search");
                handleTooltipOpen("pesquisa");
              }}
              onMouseEnter={() => handleTooltipOpen("pesquisa")}
              onMouseLeave={handleTooltipClose}
               className={tab === "search" ? classes.iconButtonActive : classes.iconButtonInactive}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <Can
            role={user.profile}
            perform="tickets-manager:showall"
            yes={() => (
              <Tooltip
                title="Mostrar Todos"
                arrow
                open={tooltipOpen === "mostrarTodos"}
                onClose={handleTooltipClose}
                classes={{ tooltip: tooltipOpen === "mostrarTodos" ? classes.iconButtonActive : undefined }}
              >
                <Switch
                  checked={showAllTickets}
                  onChange={() => {
                    setShowAllTickets((prevState) => !prevState);
                    handleTooltipOpen("mostrarTodos");
                  }}
                  onMouseEnter={() => handleTooltipOpen("mostrarTodos")}
                  onMouseLeave={handleTooltipClose}
                  color="primary"
                />
              </Tooltip>
            )}
          />
        </div>
      </div>
      <div className={classes.searchContainer}>
        <InputBase
          className={classes.searchInput}
          inputRef={searchInputRef}
          placeholder="Pesquisar ou começar uma nova conversa"
          type="search"
          onChange={handleSearch}
        />
        <TicketsQueueSelect
          style={{ marginLeft: 8, minWidth: 150 }}
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </div>
      <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={openCount}
                color="primary"
              >
                {i18n.t("ticketsList.assignedHeader")}
              </Badge>
            }
            value={"open"}
            name="open"
            classes={{ root: classes.tabPanelItem }}
          />
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                color="secondary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
            name="pending"
            classes={{ root: classes.tabPanelItem }}
          />
        </Tabs>
        <Paper className={classes.ticketsWrapper}>
          <TicketsList
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
            tags={selectedTags}
            users={selectedUsers}
          />
          <TicketsList
            status="pending"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
            tags={selectedTags}
            users={selectedUsers}
          />
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="group" className={classes.ticketsWrapper}>
        <Tabs
          value={tabOpen}
          onChange={handleChangeTabOpen}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={openCount}
                color="primary"
              >
                {i18n.t("ticketsList.assignedHeader")}
              </Badge>
            }
            value={"open"}
          />
          <Tab
            label={
              <Badge
                className={classes.badge}
                badgeContent={pendingCount}
                color="primary"
              >
                {i18n.t("ticketsList.pendingHeader")}
              </Badge>
            }
            value={"pending"}
          />
        </Tabs>
        <Paper className={classes.ticketsWrapper}>
          <TicketsListGroup
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsListGroup
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </Paper>
      </TabPanel>
      <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
        <TicketsList
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          tags={selectedTags}
          users={selectedUsers}
        />
        <TicketsListGroup
          status="closed"
          showAll={true}
          selectedQueueIds={selectedQueueIds}
        />
      </TabPanel>
      <TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
        <TagsFilter onFiltered={handleSelectedTags} />
        {user.profile === "admin" && (
          <UsersFilter onFiltered={handleSelectedUsers} />
        )}
        <TicketsList
          searchParam={searchParam}
          showAll={true}
          selectedQueueIds={selectedQueueIds}
          tags={selectedTags}
          users={selectedUsers}
        />
      </TabPanel>
    </Paper>
  );
};

export default TicketsManagerTabs;
