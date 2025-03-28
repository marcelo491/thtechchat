import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from "react-router-dom";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Modal from "@material-ui/core/Modal";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Button, Card, CardContent } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles"; 
import NewTicketModal from "../NewTicketModal";
import { generateColor } from "../../helpers/colorGenerator"; 
import { getInitials } from "../../helpers/getInitials"; 

const VCardPreview = ({ contact, numbers }) => {
    const history = useHistory();
    const { user } = useContext(AuthContext);
    const theme = useTheme(); 

    const [selectedContact, setContact] = useState({
        name: contact || "",
        number: numbers.replace(/\D/g, "") || "",
        profilePicUrl: ""
    });

    const [selectedQueue, setSelectedQueue] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [isContactValid, setContactValid] = useState(true);
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});

    const handleQueueSelection = async (queueId) => {
        setSelectedQueue(queueId);
        setModalOpen(false);
        if (queueId !== "") {
            await createTicket(queueId);
        }
    };

    const renderQueueModal = () => {
        return (
            <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: theme.palette.background.paper,
                    padding: "20px",
                    outline: "none",
                }}>
                    <h2>Selecione a Fila</h2>
                    {user.queues.map((queue) => (
                        <div key={queue.id}>
                            <Button onClick={() => handleQueueSelection(queue.id)}>
                                {queue.name}
                            </Button>
                        </div>
                    ))}
                </div>
            </Modal>
        );
    };

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                let contactObj = {
                    name: selectedContact.name,
                    number: selectedContact.number,
                    email: ""
                };

                const { data } = await api.post("/contacts", contactObj);

                if (data.alreadyExists) {
                    setContact(data.existingContact);
                } else {
                    setContact(contactObj);
                }
            
                if (data.invalido) {
                    setContactValid(false);
                }
            } catch (err) {
                toastError(err);
            }
        };

        const delayDebounceFn = setTimeout(fetchContacts, 1500);
        return () => clearTimeout(delayDebounceFn);
    }, [selectedContact.name, selectedContact.number]);

    const handleNewChat = () => {
        if (selectedQueue === "") {
            setModalOpen(true);
        } else {
            createTicket();
        }
    };

    const createTicket = async (queueId) => {
        try {
            let contactId = selectedContact.id;

            if (!contactId) {
                const contactObj = {
                    name: selectedContact.name,
                    number: selectedContact.number,
                    email: ""
                };

                const { data } = await api.post("/contacts", contactObj);
                contactId = data.existingContact.id;
            }

            const { data: ticket } = await api.post("/tickets", {
                contactId,
                queueId,
                userId: user.id,
                status: "open",
            });
            
            history.push(`/tickets/${ticket.uuid}`);
        } catch (err) {
            toastError(err);
        }
    };

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.uuid !== undefined) {
            history.push(`/tickets/${ticket.uuid}`);
        }
    };

    return (
        <>
            {renderQueueModal()}
            <Card style={{ minWidth: "300px", maxWidth: "400px", margin: "10px", padding: "10px" }}>
                <NewTicketModal
                    modalOpen={newTicketModalOpen}
                    initialContact={selectedContact}
                    onClose={(ticket) => {
                        handleCloseOrOpenTicket(ticket);
                    }}
                />
                <CardContent>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={3}>
                            <Avatar 
                                src={selectedContact.profilePicUrl} 
                                style={{ 
                                    width: 60, 
                                    height: 60, 
                                    backgroundColor: generateColor(selectedContact.number), 
                                    color: "white", 
                                    fontWeight: "bold", 
                                    marginBottom: '2px', // Ajustando o espaço abaixo do avatar
                                }}
                            >
                                {getInitials(selectedContact.name)}
                            </Avatar>
                        </Grid>
                        <Grid item xs={9}>
                            <Typography variant="h6" style={{ marginBottom: "5px", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {selectedContact.name}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Celular:</strong>
                            </Typography>
                            <Typography variant="body2" style={{ marginBottom: "10px" }}>
                                {selectedContact.number}
                            </Typography>
                        </Grid>
                    </Grid>
                    
                    <Button
                        fullWidth
                        color="#F0F0F0"
                        variant="outlined" // Usar variant outlined para bordas suaves
                        style={{ borderRadius: '20px', padding: '5px 5px', minWidth: '80px', fontSize: '0.7rem' }} // Reduzindo o padding e o tamanho da fonte
                        onClick={() => {
                            setContactTicket(selectedContact);
                            setNewTicketModalOpen(true);
                        }}
                        disabled={!selectedContact.number || !isContactValid}
                    >
                        Conversar
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};

export default VCardPreview;
