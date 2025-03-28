import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import Board from 'react-trello';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { AuthContext } from '../../context/Auth/AuthContext';
import api from '../../services/api';
import { i18n } from '../../translate/i18n';
import TagModal from '../../components/TagModal';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import SearchIcon from '@material-ui/icons/Search';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import toastError from '../../errors/toastError';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import ConfirmationModal from '../../components/ConfirmationModal';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: theme.spacing(2),
    backgroundColor: "#f4f5f7",
    height: "100vh",
  },
  headerContainer: {
    display: "flex",
    borderRadius: "10px",
    alignItems: "center",
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  lane: {
    backgroundColor: "#EEEEEE",
    borderRadius: "12px",
    boxShadow: "none",
    padding: "15px",
    border: "1px solid #EEEEEE",
  },
  searchField: {
    marginRight: theme.spacing(2),
    flex: '0 0 600px',
    maxWidth: '400px',
    minWidth: '300px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '0',
      '& fieldset': {
        border: 'none',
        borderBottom: '1px solid #ccc',
      },
      '&:hover fieldset': {
        borderBottom: '2px solid #aaa',
      },
      '&.Mui-focused fieldset': {
        borderBottom: '2px solid #3f51b5',
      },
    },
    '& .MuiInputBase-input': {
      padding: '6px 0',
    },
  },
  paginationContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(2),
  },
  buttonContainer: {
    marginLeft: theme.spacing(2),
  },
  button: {
    backgroundColor: theme.palette.primary.main,
    border: "none",
    padding: "10px 20px",
    color: "white",
    fontWeight: "bold",
    borderRadius: "50px",
    cursor: "pointer",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#161D54",
    },
  },
  laneHeader: {
    display: 'flex',
    borderRadius: "10px",
    alignItems: 'center',
  },
  laneActions: {
    display: 'flex',
    borderRadius: "10px",
    alignItems: 'center',
    marginLeft: 'auto',
  },
  laneTitle: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
  laneContainer: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    borderRadius: "12px",
    backgroundColor: "#fff",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    border: "4px solid",
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatar: {
    marginRight: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    fontSize: '1rem',
  },
  contactName: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
}));

// Função para gerar uma cor baseada em uma string (geralmente o nome ou número)
const generateColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `#${((hash >> 24) & 0xFF).toString(16).padStart(2, '0')}${((hash >> 16) & 0xFF).toString(16).padStart(2, '0')}${((hash >> 8) & 0xFF).toString(16).padStart(2, '0')}`;
  return color;
};

// Função para obter as iniciais de um nome
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

// Função para truncar strings e adicionar "..." se ultrapassar o limite
const truncateString = (str, maxLength) => {
  if (!str) return str;
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [file, setFile] = useState({ lanes: [] });
  const [tickets, setTickets] = useState([]);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const { user } = useContext(AuthContext);
  
  // Renomeando jsonString para queueIds
  const queueIds = user.queues.map(queue => queue.UserQueue.queueId);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      await fetchTickets(queueIds);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchTags();
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchTickets = async (queueIds) => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(queueIds),
          teste: true
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  const maskPhoneNumber = (number) => {
    return number.replace(/(\d{4})(\d{4})$/, '****$2');
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < Math.ceil(tags.length / itemsPerPage) ? prev + 1 : prev));
  };

  const popularCards = (searchQuery) => {
    const filteredTickets = tickets.filter(ticket => {
      const matchesSearch = searchQuery
        ? ticket.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.contact.number.includes(searchQuery) ||
          ticket.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesSearch;
    });

    const filteredTags = tags.filter(tag =>
      searchQuery
        ? tag.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("Ticket em aberto"),
        label: filteredTickets.filter(ticket => ticket.tags.length === 0).length.toString(),
        cards: filteredTickets
          .filter(ticket => ticket.tags.length === 0)
          .map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div>
                <Typography variant="body2" color="textPrimary">
                  <strong>Número</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary" style={{ display: 'flex', alignItems: 'center' }}>
                  <WhatsAppIcon style={{ marginRight: '2px', color: '#25D366', fontSize: '18px' }} />
                  {maskPhoneNumber(ticket.contact.number)}
                </Typography>
                <Typography variant="body2" color="textPrimary" style={{ marginTop: "8px" }}>
                  <strong>Mensagem</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {truncateString(ticket.lastMessage, 50)}
                </Typography>
                <button
                  className={classes.button}
                  onClick={() => handleCardClick(ticket.uuid)}
                  style={{ marginTop: "12px" }}
                >
                  Ver Ticket
                </button>
              </div>
            ),
            title: (
              <div className={classes.titleContainer}>
                <Avatar
                  className={classes.avatar}
                  style={{
                    backgroundColor: generateColor(ticket.contact.name),
                    color: "white",
                  }}
                  src={ticket.contact.profilePicUrl || undefined}
                >
                  {!ticket.contact.profilePicUrl && getInitials(ticket.contact.name)}
                </Avatar>
                <span className={classes.contactName}>
                  {truncateString(ticket.contact.name, 20)}
                </span>
              </div>
            ),
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
      },
      ...filteredTags
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map(tag => {
          const ticketsInTag = filteredTickets.filter(ticket => {
            const tagIds = ticket.tags.map(t => t.id);
            return tagIds.includes(tag.id);
          });

          return {
            id: tag.id.toString(),
            title: (
              <div className={classes.laneHeader}>
                <div className={classes.laneTitle}>
                  <span>{`${ticketsInTag.length} - ${tag.name}`}</span>
                </div>
                <div className={classes.laneActions}>
                  <IconButton size="small" onClick={() => handleEditLane(tag)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteLane(tag)}>
                    <DeleteOutlineIcon />
                  </IconButton>
                </div>
              </div>
            ),
            label: '',
            cards: ticketsInTag.map(ticket => ({
              id: ticket.id.toString(),
              label: "Ticket nº " + ticket.id.toString(),
              description: (
                <div>
                  <Typography variant="body2" color="textPrimary">
                    <strong>Número</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" style={{ display: 'flex', alignItems: 'center' }}>
                    <WhatsAppIcon style={{ marginRight: '2px', color: '#25D366', fontSize: '18px' }} />
                    {maskPhoneNumber(ticket.contact.number)}
                  </Typography>
                  <Typography variant="body2" color="textPrimary" style={{ marginTop: "8px" }}>
                    <strong>Mensagem</strong>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {truncateString(ticket.lastMessage, 50)}
                  </Typography>
                  <button
                    className={classes.button}
                    onClick={() => handleCardClick(ticket.uuid)}
                    style={{ marginTop: "12px" }}
                  >
                    Ver Ticket
                  </button>
                </div>
              ),
              title: (
                <div className={classes.titleContainer}>
                  <Avatar
                    className={classes.avatar}
                    style={{
                      backgroundColor: generateColor(ticket.contact.name),
                      color: "white",
                    }}
                    src={ticket.contact.profilePicUrl || undefined}
                  >
                    {!ticket.contact.profilePicUrl && getInitials(ticket.contact.name)}
                  </Avatar>
                  <span className={classes.contactName}>
                    {truncateString(ticket.contact.name, 20)}
                  </span>
                </div>
              ),
              draggable: true,
              href: "/tickets/" + ticket.uuid,
            })),
            style: {
              backgroundColor: tag.color,
              color: "white",
              boxShadow: "none",
              border: "1px solid #fff",
              boxSizing: "border-box",
              padding: "15px",
              borderRadius: "10px",
            },
          };
        }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(searchQuery);
  }, [tags, tickets, searchQuery, currentPage]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateLane = async (newTag) => {
    try {
      const response = await api.post("/tags", { ...newTag, kanban: 1 });
      const createdTag = response.data;

      setTags((prevTags) => [...prevTags, createdTag]);

      popularCards(searchQuery);

      toast.success(i18n.t("tags.toasts.created"));
      setTagModalOpen(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleEditLane = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteLane = (tag) => {
    setSelectedTag(tag);
    setConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/tags/${selectedTag.id}`);
      toast.success(i18n.t("tags.toasts.deleted"));
      setTags(prevTags => prevTags.filter(tag => tag.id !== selectedTag.id));
      setConfirmModalOpen(false);
      setSelectedTag(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.headerContainer}>
        <TextField
          className={classes.searchField}
          variant="outlined"
          placeholder={i18n.t("Pesquisar...")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon />,
          }}
        />

        <div className={classes.paginationContainer}>
          <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
            <ChevronLeftIcon />
          </IconButton>
          <span>Página {currentPage}</span>
          <IconButton onClick={handleNextPage} disabled={currentPage === Math.ceil(tags.length / itemsPerPage)}>
            <ChevronRightIcon />
          </IconButton>
        </div>

        <Button
          variant="contained"
          color="primary"
          className={classes.buttonContainer}
          onClick={() => setTagModalOpen(true)}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            minWidth: "0",
          }}
        >
          <AddIcon />
        </Button>
      </div>
      <Board
        data={file}
        onCardMoveAcrossLanes={handleCardMove}
        hideCardDeleteIcon
        style={{ backgroundColor: 'rgba(252, 252, 252, 0.03)' }}
        laneStyle={{
          backgroundColor: "#EEEEEE",
          borderRadius: "8px",
          boxShadow: "none",
          padding: "8px",
          border: "1px solid #EEEEEE",
        }}
        cardStyle={{
          padding: "16px",
          marginBottom: "16px",
          borderRadius: "8px",
          backgroundColor: "#fff",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          }
        }}
      />
      <TagModal
        open={tagModalOpen}
        onClose={() => setTagModalOpen(false)}
        onSave={handleCreateLane}
        kanban={1}
        tagId={selectedTag && selectedTag.id}
      />
      <ConfirmationModal
        title={i18n.t("Você tem certeza que quer excluir esta Lane?")}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
      >
        {i18n.t("Esta ação não pode ser revertida.")}
      </ConfirmationModal>
    </div>
  );
};

export default Kanban;
