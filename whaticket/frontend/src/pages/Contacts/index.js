import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';

import PopupState, {
  bindMenu,
  bindTrigger,
} from 'material-ui-popup-state';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  Checkbox,
  Menu,
  MenuItem,
} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import { generateColor } from "../../helpers/colorGenerator";
import { getInitials } from "../../helpers/getInitials";
import {
  ArrowDropDown,
  Backup,
  ContactPhone,
  GetApp,
} from '@material-ui/icons';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import * as XLSX from "xlsx";
import ConfirmationModal from '../../components/ConfirmationModal/';
import ContactModal from '../../components/ContactModal';
import MainContainer from '../../components/MainContainer';
import MainHeader from '../../components/MainHeader';
import MainHeaderButtonsWrapper
  from '../../components/MainHeaderButtonsWrapper';
import NewTicketModal from '../../components/NewTicketModal';
import TableRowSkeleton from '../../components/TableRowSkeleton';
import Title from '../../components/Title';
import { AuthContext } from '../../context/Auth/AuthContext';
import toastError from '../../errors/toastError';
import api from '../../services/api';
import { socketConnection } from '../../services/socket';
import { i18n } from '../../translate/i18n';

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    background: theme.palette.fundoBackground,
  },
  icon: {
    color: theme.palette.primary.main,
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [importContactModalOpen, setImportContactModalOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);
  const [ImportContacts, setImportContacts] = useState(null);
  const [blockingContact, setBlockingContact] = useState(null);
  const [unBlockingContact, setUnBlockingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmChatsOpen, setConfirmChatsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const fileUploadRef = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [deletingAllContact, setDeletingAllContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteAllButton, setShowDeleteAllButton] = useState(false);
  
  const handleExportContacts = () => {
  const dataToExport =
    selectedContacts.length > 0
      ? contacts.filter((contact) => selectedContacts.includes(contact.id)) // Exportar apenas selecionados
      : contacts; // Exportar todos os contatos

  const worksheetData = dataToExport.map((contact) => ({
    Nome: contact.name,        // Nome do contato
    Numero: contact.number,    // Número de telefone
    Email: contact.email,      // E-mail do contato
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos");
  XLSX.writeFile(workbook, "contatos.xlsx");

  toast.success(
    selectedContacts.length > 0
      ? `Exportados ${selectedContacts.length} contatos selecionados!`
      : "Exportados todos os contatos!"
  );
};


  const handleContactSelect = (contactId) => {
    const isSelected = selectedContacts.includes(contactId);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleImportExcel = async () => {
    try {
        const formData = new FormData();
        formData.append("file", fileUploadRef.current.files[0]);
        await api.request({
            url: `/contacts/upload`,
            method: "POST",
            data: formData,
        });
        history.go(0);
    } catch (err) {
        toastError(err);
    }
};


useEffect(() => {
  setShowDeleteAllButton(selectAll);
}, [selectAll]);
  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, selectedTags]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/contacts/", {
            params: { searchParam, pageNumber, contactTag: JSON.stringify(selectedTags) },
          });
          dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, selectedTags]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        userId: user?.id,
        status: "open",
      });
      history.push(`/tickets/${ticket.uuid}`);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setSearchParam("");
    setPageNumber(1);
  };
  const handleSelectAllContacts = () => {
    if (selectAll) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteAllContact = async () => {
    try {
      await api.delete("/contacts");
      toast.success(i18n.t("contacts.toasts.deletedAll"));
      history.go(0);
      setSearchParam("");
      setPageNumber(1);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteSingleContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deletedSingle"));
      setSelectedContacts(prevSelectedIds =>
        prevSelectedIds.filter(id => id !== contactId)
      );
    } catch (err) {
      toastError(err);
    }
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      history.go(0);
      setImportContacts(false);
    } catch (err) {
      toastError(err);
      setImportContacts(false);
    }
  };

  const handleimportChats = async () => {
    try {
      await api.post("/contacts/import/chats");
      history.go(0);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleDeleteSelectedContacts = async () => {
    try {
      await Promise.all(selectedContacts.map(contactId => api.delete(`/contacts/${contactId}`)));
      toast.success(i18n.t("contacts.toasts.deletedSelected"));
      setSelectedContacts([]);
      setSearchParam("");
      setPageNumber(1);
    } catch (err) {
      toastError(err);
    }
  };

  function getDateLastMessage(contact) {
    if (!contact || !contact.tickets || contact.tickets.length === 0) return null;
    const date = new Date(contact.tickets[contact.tickets.length - 1].updatedAt);
    const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={(ticket) => handleCloseOrOpenTicket(ticket)}
      />
      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      ></ContactModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${deletingContact.name}?`
            : deletingAllContact ? `${i18n.t("contacts.confirmationModal.deleteAllTitle")}`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={(e) =>
          deletingContact
            ? handleDeleteContact(deletingContact.id)
            : ImportContacts
            ? handleimportContact()
            : handleImportExcel()
        }
      >
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : deletingAllContact ? `${i18n.t("contacts.confirmationModal.deleteAllMessage")}`
          : ImportContacts ? `${i18n.t("contacts.confirmationModal.importMessage")}`
          : `${i18n.t("contactListItems.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <ConfirmationModal
        title={"Importar Conversas"}
        open={confirmChatsOpen}
        onClose={setConfirmChatsOpen}
        onConfirm={(e) => handleimportChats()}
      >
        Deseja importar todas as conversas do telefone?
      </ConfirmationModal>
      <MainHeader>
        <Title>{i18n.t("contacts.title")} ({contacts.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button
                  variant="contained"
                  color="primary"
                  {...bindTrigger(popupState)}
                >
                  Importar
                  <ArrowDropDown />
                </Button>
                <Menu {...bindMenu(popupState)}>
                  <MenuItem
                    onClick={() => {
                      setConfirmOpen(true);
                      setImportContacts(true);
                      popupState.close();
                    }}
                  >
                    <ContactPhone
                      fontSize="small"
                      color="primary"
                      style={{
                        marginRight: 10,
                      }}
                    />
                    Importar Agenda
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      fileUploadRef.current.value = null;
                      fileUploadRef.current.click();
                    }}
                  >
                    <Backup
                      fontSize="small"
                      color="primary"
                      style={{
                        marginRight: 10,
                      }}
                    />
                    Importar Excel
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/Modelo-contato.xlsx'; // Caminho dentro da pasta public
                      link.download = 'Modelo-contato.xlsx';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      popupState.close();
                    }}
                  >
                    <GetApp
                      fontSize="small"
                      color="primary"
                      style={{
                        marginRight: 10,
                      }}
                    />
                    Baixar Modelo Excel
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactModal}
          >
            {i18n.t("contacts.buttons.add")}
          </Button>
          {selectedContacts.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleDeleteSelectedContacts();
              }}
            >
              Excluir
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSelectAllContacts}
          >
            {selectAll ? 'Desmarcar todos' : 'Marcar todos'}
          </Button>
         <Button
  variant="contained"
  color="primary"
  onClick={handleExportContacts}
>
  EXPORTAR CONTATOS
</Button>

        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined" onScroll={handleScroll}>
        <>
          <input
            style={{ display: "none" }}
            id="upload"
            name="file"
            type="file"
            accept=".xls,.xlsx"
            onChange={() => {
              setConfirmOpen(true);
            }}
            ref={fileUploadRef}
          />
        </>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedContacts.length > 0 &&
                    selectedContacts.length < contacts.length
                  }
                  checked={selectedContacts.length === contacts.length}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectedContacts(checked ? contacts.map(contact => contact.id) : []);
                  }}
                />
              </TableCell>
              <TableCell>{i18n.t("contacts.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("contacts.table.whatsapp")}</TableCell>
              <TableCell align="center">{i18n.t("contacts.table.email")}</TableCell>
              <TableCell align="center">{i18n.t("contacts.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
             {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleContactSelect(contact.id)}
                    />
                  </TableCell>
                  <TableCell style={{ display: 'flex', alignItems: 'center' }}>
                    {<Avatar style={{ backgroundColor: generateColor(contact?.number), fontWeight: "bold", color: "white" }} src={contact.profilePicUrl}>{getInitials(contact?.name)}</Avatar>}
                    <span style={{ marginLeft: 8 }}>{contact.name}</span>
                  </TableCell>
                  <TableCell align="center">{user.isTricked === "enabled" ? contact.number : contact.number.slice(0, -4) + "****"}</TableCell>
                  <TableCell align="center">{contact.email}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setContactTicket(contact);
                        setNewTicketModalOpen(true);
                      }}
                    >
                      <WhatsAppIcon color="primary" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => hadleEditContact(contact.id)}
                    >
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmOpen(true);
                        setDeletingContact(contact);
                      }}
                    >
                      <DeleteOutlineIcon color="primary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );

};

export default Contacts;
