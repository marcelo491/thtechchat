import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Paper,
  InputBase,
  Tabs,
  Tab,
  Badge,
  IconButton,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import LibraryBooksIcon from "@material-ui/icons/LibraryBooks";
import LibraryAddCheckIcon from "@material-ui/icons/LibraryAddCheck";
import GroupIcon from "@material-ui/icons/Group";
import AddIcon from "@material-ui/icons/Add"; // Importando o ícone de adicionar

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
    background: theme.palette.optionsBackground,
  },
  tabsHeader: {
    flex: "none",
    backgroundColor: theme.palette.tabHeaderBackground,
  },
  ticketOptionsBox: {
    backgroundColor: theme.palette.tabHeaderBackground,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: theme.palette.optionsBackground,
    padding: theme.spacing(1),
  },
  searchInput: {
    backgroundColor: theme.palette.type === "dark" ? "#333" : "#F7F8FA", // Ajuste de fundo no modo escuro
    flex: 1,
    border: "5",
    borderRadius: 8,
    padding: "5px",
    outline: "none",
    color: theme.palette.type === "dark" ? "#fff" : "#000", // Cor do texto ajustada
    "&::placeholder": {
      color: theme.palette.type === "dark" ? "#aaa" : "#888", // Cor do placeholder no modo escuro
    },
  },
  searchIcon: {
    color: theme.palette.type === "dark" ? "#fff" : "#000", // Ajuste de cor para o ícone
    marginRight: theme.spacing(2),
  },
  tab: {
    backgroundColor: theme.palette.tabHeaderBackground,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    minWidth: 70,
    fontSize: 12,
    marginLeft: "none",
    background: theme.palette.optionsBackground,
  },
  tabPanelItem: {
    backgroundColor: theme.palette.tabHeaderBackground,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    background: theme.palette.optionsBackground,
    minWidth: 80,
    fontSize: 12,
    marginLeft: 0,
  },
  addButton: {
    backgroundColor: theme.palette.primary.main, // Fundo na cor principal do tema
    color: "#fff", // Cor do ícone
    '&:hover': {
      backgroundColor: theme.palette.primary.dark, // Cor de fundo ao passar o mouse
    },
    borderRadius: 8, // Bordas arredondadas
    padding: 8, // Espaçamento interno
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
  const [showAllTickets, setShowAllTickets] = useState(
    user.profile.toUpperCase() === "ADMIN" || user.allUserChat === "enabled"
  );
  const [selectedQueueIds, setSelectedQueueIds] = useState(
    user.queues.map((q) => q.id) || []
  );
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const searchInputRef = useRef();

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

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
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

  return (
    <Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={() => setNewTicketModalOpen(false)}
      />
      <Paper elevation={0} square className={classes.tabsHeader}>
        <Tabs
          value={tab}
          onChange={handleChangeTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="icon label tabs example"
        >
          <Tab
            value={"open"}
            icon={<LibraryBooksIcon />}
            label={i18n.t("tickets.tabs.open.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"closed"}
            icon={<LibraryAddCheckIcon />}
            label={i18n.t("tickets.tabs.closed.title")}
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"group"}
            icon={<GroupIcon />}
            label="Grupos"
            classes={{ root: classes.tab }}
          />
          <Tab
            value={"search"}
            icon={<SearchIcon />}
            label={i18n.t("tickets.tabs.search.title")}
            classes={{ root: classes.tab }}
          />
        </Tabs>
      </Paper>
      <Paper square elevation={0} className={classes.ticketOptionsBox}>
        <SearchIcon className={classes.searchIcon} />
        <InputBase
          className={classes.searchInput}
          inputRef={searchInputRef}
          placeholder={i18n.t("tickets.search.placeholder")}
          type="search"
          onChange={handleSearch}
        />
      </Paper>
      {tab !== "search" && (
        <Paper square elevation={0} className={classes.ticketOptionsBox}>
          <>
            <IconButton
              className={classes.addButton}
              onClick={() => setNewTicketModalOpen(true)}
            >
              <AddIcon />
            </IconButton>
            <Can
              role={user.profile}
              perform="tickets-manager:showall"
              yes={() => (
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() =>
                        setShowAllTickets((prevState) => !prevState)
                      }
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            />
          </>
          <TicketsQueueSelect
            style={{ marginLeft: 6 }}
            selectedQueueIds={selectedQueueIds}
            userQueues={user?.queues}
            onChange={(values) => setSelectedQueueIds(values)}
          />
        </Paper>
      )}
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
